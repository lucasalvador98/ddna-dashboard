// Pure CSV builder for form responses (admin export).
// Columns = field labels in definition order (heading fields are skipped) +
// `submitted_at`. Array values joined with '; '. BOM added for Excel.

import type { DefinicionFormulario, FormularioRespuesta } from './types';

const CELL_SEPARATOR = ';';
const LINE_SEPARATOR = '\r\n';
const BOM = '\uFEFF';

function escapeCsvCell(value: string): string {
  // Neutralise CSV/Excel formula injection: if a cell starts with =, +, -, @
  // or a control char (tab/CR), prepend a single quote so spreadsheet apps
  // treat it as a literal string instead of a formula or command.
  let v = value;
  if (/^[=+\-@\t\r]/.test(v)) {
    v = "'" + v;
  }
  if (/[",\n\r;]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

function answerableFields(def: DefinicionFormulario) {
  return def.fields.filter((field) => field.type !== 'heading');
}

export function buildCsv(def: DefinicionFormulario, respuestas: FormularioRespuesta[]): string {
  const fields = answerableFields(def);
  const header = [...fields.map((field) => field.label), 'submitted_at']
    .map(escapeCsvCell)
    .join(CELL_SEPARATOR);

  const rows = respuestas.map((respuesta) => {
    const cells = fields.map((field) => {
      const value = respuesta.respuestas[field.id];
      if (value === undefined || value === null) return '';
      return Array.isArray(value) ? value.join('; ') : String(value);
    });
    cells.push(respuesta.submitted_at);
    return cells.map(escapeCsvCell).join(CELL_SEPARATOR);
  });

  return BOM + [header, ...rows].join(LINE_SEPARATOR);
}
