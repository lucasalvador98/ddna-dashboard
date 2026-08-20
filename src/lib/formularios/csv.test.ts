import { describe, it, expect } from 'vitest';
import { buildCsv } from './csv';
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

describe('buildCsv', () => {
  it('prepends a BOM for Excel compatibility', () => {
    const csv = buildCsv(def, []);
    expect(csv.startsWith('\uFEFF')).toBe(true);
  });

  it('uses field labels in definition order plus submitted_at, skipping headings', () => {
    const csv = buildCsv(def, []);
    const body = csv.replace('\uFEFF', '');
    const header = body.split('\r\n')[0];
    expect(header).toBe('Nombre;Intereses;submitted_at');
  });

  it('joins array values with "; " (quoted since the cell contains the delimiter)', () => {
    const csv = buildCsv(def, [respuesta()]);
    const body = csv.replace('\uFEFF', '');
    const row = body.split('\r\n')[1];
    expect(row).toBe('Ana;"A; B";2026-08-11T13:00:00Z');
  });

  it('renders empty cells for missing answers', () => {
    const csv = buildCsv(def, [respuesta({ respuestas: {} })]);
    const body = csv.replace('\uFEFF', '');
    const row = body.split('\r\n')[1];
    expect(row).toContain(';;2026-08-11T13:00:00Z');
  });

  it('escapes quotes, commas, semicolons and newlines inside cells', () => {
    const csv = buildCsv(def, [
      respuesta({ respuestas: { nombre: 'Say "hola", ;\namigo', intereses: [] } }),
    ]);
    const body = csv.replace('\uFEFF', '');
    const row = body.split('\r\n')[1];
    expect(row).toContain('"Say ""hola"", ;');
  });

  it('returns header only when there are no responses', () => {
    const csv = buildCsv(def, []);
    const body = csv.replace('\uFEFF', '');
    expect(body.split('\r\n')).toHaveLength(1);
  });

  // CSV/Excel formula injection guard. See CVE-2014-3524.
  it('neutralises cells starting with = (formula injection)', () => {
    const csv = buildCsv(def, [
      respuesta({ respuestas: { nombre: '=cmd|"/c calc"!A1', intereses: [] } }),
    ]);
    const body = csv.replace('\uFEFF', '');
    const row = body.split('\r\n')[1];
    // Must NOT start with '=' literally (otherwise Excel/LibreOffice executes it).
    // Unwrap the optional surrounding quotes to inspect the cell content.
    const cellRaw = row.split(';')[0];
    const unquoted = cellRaw.startsWith('"') && cellRaw.endsWith('"')
      ? cellRaw.slice(1, -1).replace(/""/g, '"')
      : cellRaw;
    expect(unquoted.startsWith('=')).toBe(false);
    // The neutralisation marker must be present
    expect(unquoted.startsWith("'=")).toBe(true);
  });

  it('neutralises cells starting with +, -, @ (formula injection)', () => {
    const csv = buildCsv(def, [
      respuesta({ respuestas: { nombre: '+sum(1+1)', intereses: [] } }),
    ]);
    const body = csv.replace('\uFEFF', '');
    const row = body.split('\r\n')[1];
    expect(row).toContain("'+sum(1+1)");

    const csv2 = buildCsv(def, [
      respuesta({ respuestas: { nombre: '-2+3', intereses: [] } }),
    ]);
    const row2 = csv2.replace('\uFEFF', '').split('\r\n')[1];
    expect(row2).toContain("'-2+3");

    const csv3 = buildCsv(def, [
      respuesta({ respuestas: { nombre: '@SUM(1+1)', intereses: [] } }),
    ]);
    const row3 = csv3.replace('\uFEFF', '').split('\r\n')[1];
    expect(row3).toContain("'@SUM(1+1)");
  });

  it('does not prefix safe values (numbers, normal text) with a quote', () => {
    const csv = buildCsv(def, [
      respuesta({ respuestas: { nombre: 'Ana López', intereses: [] } }),
    ]);
    const body = csv.replace('\uFEFF', '');
    const row = body.split('\r\n')[1];
    expect(row).toContain('Ana López;');
    expect(row).not.toContain("'Ana");
  });
});
