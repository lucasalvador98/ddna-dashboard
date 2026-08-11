// Pure validators for the formularios module (no zod — spec zero-deps decision).
// `validateDefinition` checks a persisted definition; `validateResponse` checks a
// submit payload (strips hidden/unknown fields, type-checks the rest).
// Error strings are Spanish (UI-facing); identifiers/comments in English.

import { MAX_FIELDS, MAX_RULES } from './defaults';
import { evaluateLogic } from './logic';
import { FORMULARIO_VERSION } from './types';
import type { CampoFormulario, DefinicionFormulario, TipoCampo } from './types';

export type ValidationResult = { valid: true; errors: [] } | { valid: false; errors: string[] };

export type ResponseValidationResult = {
  valid: boolean;
  errors: string[];
  /** Cleaned answers: only visible, known, type-valid field values. */
  answers: Record<string, unknown>;
};

const TIPOS_CAMPO: readonly TipoCampo[] = [
  'text',
  'textarea',
  'number',
  'date',
  'select',
  'radio',
  'checkbox',
  'scale',
  'email',
  'phone',
  'heading',
];

const TIPOS_FUENTE_LOGICA: ReadonlySet<TipoCampo> = new Set(['select', 'radio', 'checkbox', 'scale']);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s().-]{6,}$/;
const DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

// ---------------------------------------------------------------- definition

export function validateDefinition(def: unknown): ValidationResult {
  if (typeof def !== 'object' || def === null || Array.isArray(def)) {
    return { valid: false, errors: ['La definición debe ser un objeto.'] };
  }

  const errors: string[] = [];
  const candidate = def as Record<string, unknown>;

  if (candidate.version !== FORMULARIO_VERSION) {
    errors.push(`La versión de la definición debe ser ${FORMULARIO_VERSION}.`);
  }

  let fieldsById = new Map<string, TipoCampo>();
  if (!Array.isArray(candidate.fields)) {
    errors.push('La definición debe incluir un arreglo de campos (fields).');
  } else {
    if (candidate.fields.length > MAX_FIELDS) {
      errors.push(`La definición no puede tener más de ${MAX_FIELDS} campos.`);
    }
    fieldsById = validateFields(candidate.fields, errors);
  }

  if (!Array.isArray(candidate.logic)) {
    errors.push('La definición debe incluir un arreglo de reglas (logic).');
  } else {
    if (candidate.logic.length > MAX_RULES) {
      errors.push(`La definición no puede tener más de ${MAX_RULES} reglas.`);
    }
    validateRules(candidate.logic, fieldsById, errors);
  }

  return errors.length === 0 ? { valid: true, errors: [] } : { valid: false, errors };
}

function validateFields(fields: unknown[], errors: string[]): Map<string, TipoCampo> {
  const seenIds = new Set<string>();
  const typesById = new Map<string, TipoCampo>();

  fields.forEach((raw, index) => {
    const where = `Campo ${index + 1}`;
    if (typeof raw !== 'object' || raw === null) {
      errors.push(`${where}: debe ser un objeto.`);
      return;
    }
    const field = raw as Record<string, unknown>;

    if (typeof field.id !== 'string' || field.id.trim() === '') {
      errors.push(`${where}: el id es obligatorio.`);
    } else {
      if (seenIds.has(field.id)) {
        errors.push(`El id de campo "${field.id}" está duplicado.`);
      }
      seenIds.add(field.id);
    }

    if (typeof field.type !== 'string' || !TIPOS_CAMPO.includes(field.type as TipoCampo)) {
      errors.push(`${where}: tipo de campo no válido.`);
      return;
    }
    const type = field.type as TipoCampo;
    if (typeof field.id === 'string' && field.id.trim() !== '') {
      typesById.set(field.id, type);
    }

    if (typeof field.label !== 'string' || field.label.trim() === '') {
      errors.push(`${where}: la etiqueta (label) es obligatoria.`);
    }

    if (typeof field.required !== 'boolean') {
      errors.push(`${where}: required debe ser un booleano.`);
    } else if (type === 'heading' && field.required === true) {
      errors.push(`${where}: un encabezado no puede ser obligatorio.`);
    }

    if (type === 'select' || type === 'radio' || type === 'checkbox') {
      if (
        !Array.isArray(field.options) ||
        field.options.length === 0 ||
        field.options.some((option) => typeof option !== 'string' || option.trim() === '')
      ) {
        errors.push(`${where}: debe incluir al menos una opción válida.`);
      }
    }

    if (type === 'scale') {
      const { min, max } = field;
      if (typeof min !== 'number' || typeof max !== 'number') {
        errors.push(`${where}: min y max deben ser numéricos.`);
      } else if (min >= max) {
        errors.push(`${where}: el mínimo debe ser menor que el máximo.`);
      }
    }
  });

  return typesById;
}

function validateRules(
  rules: unknown[],
  fieldsById: Map<string, TipoCampo>,
  errors: string[]
): void {
  rules.forEach((raw, index) => {
    const where = `Regla ${index + 1}`;
    if (typeof raw !== 'object' || raw === null) {
      errors.push(`${where}: debe ser un objeto.`);
      return;
    }
    const rule = raw as Record<string, unknown>;

    if (typeof rule.field_id !== 'string' || rule.field_id.trim() === '') {
      errors.push(`${where}: field_id es obligatorio.`);
    } else {
      const sourceType = fieldsById.get(rule.field_id);
      if (!sourceType) {
        errors.push(`${where}: el campo origen "${rule.field_id}" no existe.`);
      } else if (!TIPOS_FUENTE_LOGICA.has(sourceType)) {
        errors.push(`${where}: el campo origen "${rule.field_id}" debe ser de tipo opción o escala.`);
      }
    }

    if (rule.op !== 'eq' && rule.op !== 'neq') {
      errors.push(`${where}: el operador debe ser "eq" o "neq".`);
    }

    if (typeof rule.value !== 'string' && typeof rule.value !== 'number') {
      errors.push(`${where}: el valor debe ser un string o un número.`);
    }

    if (!Array.isArray(rule.show_ids) || rule.show_ids.length === 0) {
      errors.push(`${where}: show_ids debe incluir al menos un campo destino.`);
    } else {
      rule.show_ids.forEach((target) => {
        if (typeof target !== 'string' || !fieldsById.has(target)) {
          errors.push(`${where}: el campo destino "${String(target)}" no existe.`);
        }
      });
    }
  });
}

// ---------------------------------------------------------------- response

export function validateResponse(
  def: DefinicionFormulario,
  answers: Record<string, unknown>
): ResponseValidationResult {
  const errors: string[] = [];
  const cleaned: Record<string, unknown> = {};
  const visible = evaluateLogic(def, answers);
  const fieldsById = new Map(def.fields.map((field) => [field.id, field]));

  for (const [fieldId, value] of Object.entries(answers)) {
    const field = fieldsById.get(fieldId);
    // Strip unknown field ids and values of fields hidden by logic.
    if (!field || !visible.has(fieldId)) {
      continue;
    }
    // Empty answers are treated as "not answered": dropped here so the
    // required check below reports them; non-required empties are discarded.
    if (isEmptyValue(value)) {
      continue;
    }
    const typeError = checkFieldValue(field, value);
    if (typeError) {
      errors.push(typeError);
    } else {
      cleaned[fieldId] = value;
    }
  }

  for (const field of def.fields) {
    if (field.type === 'heading' || !field.required || !visible.has(field.id)) {
      continue;
    }
    if (isEmptyValue(cleaned[field.id])) {
      errors.push(`El campo "${field.label}" es obligatorio.`);
    }
  }

  return { valid: errors.length === 0, errors, answers: cleaned };
}

function checkFieldValue(field: CampoFormulario, value: unknown): string | null {
  const label = field.label;

  switch (field.type) {
    case 'text':
    case 'textarea':
      return typeof value === 'string' ? null : `El campo "${label}" debe ser texto.`;
    case 'email':
      if (typeof value !== 'string') return `El campo "${label}" debe ser texto.`;
      return EMAIL_REGEX.test(value) ? null : 'Ingresá un email válido.';
    case 'phone':
      if (typeof value !== 'string') return `El campo "${label}" debe ser texto.`;
      return PHONE_REGEX.test(value) ? null : 'Ingresá un teléfono válido.';
    case 'number':
      return typeof value === 'number' && !Number.isNaN(value)
        ? null
        : `El campo "${label}" debe ser un número.`;
    case 'date':
      if (typeof value !== 'string') return `El campo "${label}" debe ser una fecha.`;
      return isValidIsoDate(value) ? null : 'Ingresá una fecha válida (AAAA-MM-DD).';
    case 'select':
    case 'radio':
      if (typeof value !== 'string') return `El campo "${label}" debe ser una opción válida.`;
      return field.options.includes(value) ? null : `El campo "${label}" tiene una opción no válida.`;
    case 'checkbox':
      if (!Array.isArray(value)) return `El campo "${label}" debe ser una lista de opciones.`;
      return value.every((item) => typeof item === 'string' && field.options.includes(item))
        ? null
        : `El campo "${label}" tiene una opción no válida.`;
    case 'scale':
      if (typeof value !== 'number' || Number.isNaN(value)) {
        return `El campo "${label}" debe ser un número.`;
      }
      return value >= field.min && value <= field.max
        ? null
        : `El campo "${label}" debe estar entre ${field.min} y ${field.max}.`;
    case 'heading':
      return null;
  }
}

function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function isValidIsoDate(value: string): boolean {
  const match = DATE_REGEX.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}
