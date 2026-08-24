import { describe, it, expect } from 'vitest';
import * as xlsx from 'xlsx';
import { buildXlsx } from './xlsx';
import type { DefinicionFormulario, FormularioRespuesta } from './types';

const def: DefinicionFormulario = {
  version: 1,
  fields: [
    { id: 'titulo', type: 'heading', label: 'Sección 1', required: false },
    { id: 'nombre', type: 'text', label: 'Nombre', required: true },
    { id: 'intereses', type: 'checkbox', label: 'Intereses', required: false, options: ['A', 'B'] },
  ],
  logic: [],
};

function respuesta(overrides: Partial<FormularioRespuesta> = {}): FormularioRespuesta {
  return {
    id: 'r1',
    formulario_id: 'f1',
    respuestas: { nombre: 'Ana', intereses: ['A', 'B'] },
    submitted_at: '2026-08-11T13:00:00Z',
    ...overrides,
  };
}

function readSheet(buffer: ArrayBuffer): unknown[][] {
  const wb = xlsx.read(buffer, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return xlsx.utils.sheet_to_json<unknown[]>(sheet, { header: 1 }) as unknown[][];
}

describe('buildXlsx', () => {
  it('returns a valid ArrayBuffer', () => {
    const result = buildXlsx(def, []);
    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(result.byteLength).toBeGreaterThan(0);
  });

  it('uses field labels in definition order plus submitted_at, skipping headings', () => {
    const buffer = buildXlsx(def, []);
    const rows = readSheet(buffer);
    const header = rows[0] as string[];
    expect(header).toEqual(['Nombre', 'Intereses', 'submitted_at']);
  });

  it('joins array values with "; "', () => {
    const buffer = buildXlsx(def, [respuesta()]);
    const rows = readSheet(buffer);
    const dataRow = rows[1] as unknown[];
    expect(dataRow[0]).toBe('Ana');
    expect(dataRow[1]).toBe('A; B');
    expect(dataRow[2]).toBe('2026-08-11T13:00:00Z');
  });

  it('renders empty cells for missing answers', () => {
    const buffer = buildXlsx(def, [respuesta({ respuestas: {} })]);
    const rows = readSheet(buffer);
    const dataRow = rows[1] as unknown[];
    expect(dataRow[0]).toBe('');
    expect(dataRow[1]).toBe('');
    expect(dataRow[2]).toBe('2026-08-11T13:00:00Z');
  });

  it('preserves quotes, commas, semicolons and newlines inside cells', () => {
    const buffer = buildXlsx(def, [
      respuesta({ respuestas: { nombre: 'Say "hola", ;\namigo', intereses: [] } }),
    ]);
    const rows = readSheet(buffer);
    const dataRow = rows[1] as unknown[];
    expect(dataRow[0]).toBe('Say "hola", ;\namigo');
  });

  it('returns header only when there are no responses', () => {
    const buffer = buildXlsx(def, []);
    const rows = readSheet(buffer);
    expect(rows).toHaveLength(1);
  });

  // Formula injection guard. See CVE-2014-3524.
  it('neutralises cells starting with = (formula injection)', () => {
    const buffer = buildXlsx(def, [
      respuesta({ respuestas: { nombre: '=cmd|"/c calc"!A1', intereses: [] } }),
    ]);
    const rows = readSheet(buffer);
    const dataRow = rows[1] as unknown[];
    const cell = String(dataRow[0]);
    // Must NOT start with '=' literally (otherwise Excel/LibreOffice executes it).
    expect(cell.startsWith('=')).toBe(false);
    // The neutralisation marker must be present
    expect(cell.startsWith("'=")).toBe(true);
  });

  it('neutralises cells starting with +, -, @ (formula injection)', () => {
    const buffer1 = buildXlsx(def, [
      respuesta({ respuestas: { nombre: '+sum(1+1)', intereses: [] } }),
    ]);
    const row1 = readSheet(buffer1)[1] as unknown[];
    expect(String(row1[0]).startsWith("'+sum(1+1)")).toBe(true);

    const buffer2 = buildXlsx(def, [
      respuesta({ respuestas: { nombre: '-2+3', intereses: [] } }),
    ]);
    const row2 = readSheet(buffer2)[1] as unknown[];
    expect(String(row2[0]).startsWith("'-2+3")).toBe(true);

    const buffer3 = buildXlsx(def, [
      respuesta({ respuestas: { nombre: '@SUM(1+1)', intereses: [] } }),
    ]);
    const row3 = readSheet(buffer3)[1] as unknown[];
    expect(String(row3[0]).startsWith("'@SUM(1+1)")).toBe(true);
  });

  it('does not prefix safe values (numbers, normal text) with a quote', () => {
    const buffer = buildXlsx(def, [
      respuesta({ respuestas: { nombre: 'Ana López', intereses: [] } }),
    ]);
    const rows = readSheet(buffer);
    const dataRow = rows[1] as unknown[];
    const cell = String(dataRow[0]);
    expect(cell).toBe('Ana López');
    expect(cell).not.toContain("'Ana");
  });
});
