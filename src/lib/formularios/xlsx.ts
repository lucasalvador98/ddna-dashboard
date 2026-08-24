// Pure XLSX builder for form responses (admin export).
// Columns = field labels in definition order (heading fields are skipped) +
// `submitted_at`. Array values joined with '; '.

import * as xlsx from 'xlsx';
import type { DefinicionFormulario, FormularioRespuesta } from './types';

function sanitizeCell(value: string): string {
  // Neutralise formula injection: if a cell starts with =, +, -, @ or a control
  // char (tab/CR), prepend a single quote so spreadsheet apps treat it as a
  // literal string. xlsx treats string values as strings, so this is sufficient.
  if (/^[=+\-@\t\r]/.test(value)) {
    return "'" + value;
  }
  return value;
}

function answerableFields(def: DefinicionFormulario) {
  return def.fields.filter((field) => field.type !== 'heading');
}

export function buildXlsx(
  def: DefinicionFormulario,
  respuestas: FormularioRespuesta[]
): ArrayBuffer {
  const fields = answerableFields(def);
  const header = [...fields.map((field) => field.label), 'submitted_at'];

  const rows = respuestas.map((respuesta) => {
    const cells = fields.map((field) => {
      const value = respuesta.respuestas[field.id];
      if (value === undefined || value === null) return '';
      const joined = Array.isArray(value) ? value.join('; ') : String(value);
      return sanitizeCell(joined);
    });
    cells.push(respuesta.submitted_at);
    return cells;
  });

  const data = [header, ...rows];
  const worksheet = xlsx.utils.aoa_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Respuestas');
  return xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
}
