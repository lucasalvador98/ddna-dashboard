// @vitest-environment node
//
// Round-trip and safety coverage for the XLSX extractor.
// Added with the xlsx 0.18.5 -> 0.20.3 upgrade (cdn.sheetjs.com tarball):
// the fast path (form export -> buildXlsx) and the untrusted path
// (repository parse -> extractText/JSONFromXLSX) must keep working, and
// sheet_to_json must not pollute Object.prototype (GHSA-4r6h-8v6p-xvw6).
//
// Node environment: the extractors are server-side, and the ESM build of
// xlsx >= 0.20 has no fs helpers (XLSX.readFile is unavailable there).

import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as XLSX from 'xlsx';
import { buildXlsx } from '../../formularios/xlsx';
import type { DefinicionFormulario, FormularioRespuesta } from '../../formularios/types';
import { extractJSONFromXLSX, extractTextFromXLSX } from './xlsx';

const def: DefinicionFormulario = {
  version: 1,
  fields: [
    { id: 'titulo', type: 'heading', label: 'Sección 1', required: false },
    { id: 'nombre', type: 'text', label: 'Nombre', required: true },
    { id: 'intereses', type: 'checkbox', label: 'Intereses', required: false, options: ['A', 'B'] },
  ],
  logic: [],
};

const respuesta: FormularioRespuesta = {
  id: 'r1',
  formulario_id: 'f1',
  respuestas: { nombre: 'Ana', intereses: ['A', 'B'] },
  submitted_at: '2026-08-11T13:00:00Z',
};

const tmpDir = mkdtempSync(join(tmpdir(), 'xlsx-extractor-'));

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('xlsx extractor with the patched SheetJS build', () => {
  it('round-trips a form export through extractTextFromXLSX', () => {
    const buffer = Buffer.from(buildXlsx(def, [respuesta]));

    const result = extractTextFromXLSX(buffer);

    expect(result.sheetNames).toEqual(['Respuestas']);
    expect(result.sheets).toHaveLength(1);
    expect(result.sheets[0].rows).toBe(2); // header + one answer row
    expect(result.text).toContain('Nombre');
    expect(result.text).toContain('Ana');
    expect(result.text).toContain('A; B');
  });

  it('round-trips a form export through extractJSONFromXLSX', () => {
    const json = extractJSONFromXLSX(Buffer.from(buildXlsx(def, [respuesta])));

    expect(json).toHaveLength(1);
    expect(json[0]['Nombre']).toBe('Ana');
    expect(json[0]['Intereses']).toBe('A; B');
  });

  it('reads the generated workbook from disk (ETL scripts entry point)', () => {
    const filePath = join(tmpDir, 'round-trip.xlsx');
    writeFileSync(filePath, Buffer.from(buildXlsx(def, [respuesta])));

    // The scripts read the bytes themselves and hand them to XLSX.read:
    // the ESM build of xlsx >= 0.20 has no fs helpers.
    const workbook = XLSX.read(readFileSync(filePath), { type: 'buffer' });

    expect(workbook.SheetNames).toEqual(['Respuestas']);
    expect(workbook.Sheets['Respuestas']['!ref']).toBeDefined();
  });

  it('does not pollute Object.prototype when a header is __proto__', () => {
    const evil = XLSX.utils.aoa_to_sheet([
      ['__proto__', 'safe'],
      ['polluted', 'yes'],
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, evil, 'Evil');

    const written = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const roundTripped = XLSX.read(written, { type: 'array' });
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      roundTripped.Sheets['Evil'],
      { defval: '' }
    );

    expect(Object.getPrototypeOf(rows[0])).toBe(Object.prototype);
    expect(({} as Record<string, unknown>).safe).toBeUndefined();
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
});
