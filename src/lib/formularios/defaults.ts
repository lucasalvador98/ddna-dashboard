// Defaults and limits for the formularios module.
// Identifiers/comments in English; field type labels are Spanish (DDNA convention).

import { FORMULARIO_VERSION } from './types';
import type { Bloque, CampoFormulario, DefinicionFormulario, TipoCampo } from './types';

export const MAX_FIELDS = 100;
export const MAX_RULES = 50;
export const MAX_PAYLOAD_BYTES = 65536;
export const DEFAULT_SCALE_MIN = 1;
export const DEFAULT_SCALE_MAX = 5;

export const EMPTY_DEFINICION: DefinicionFormulario = {
  version: FORMULARIO_VERSION,
  fields: [],
  logic: [],
  bloques: [],
};

/** Field type metadata. `label` is the Spanish name used in builder pickers. */
export const FIELD_TYPE_META: Record<TipoCampo, { label: string }> = {
  text: { label: 'Texto' },
  textarea: { label: 'Párrafo' },
  number: { label: 'Número' },
  date: { label: 'Fecha' },
  select: { label: 'Lista desplegable' },
  radio: { label: 'Opciones únicas' },
  checkbox: { label: 'Casillas de verificación' },
  scale: { label: 'Escala' },
  email: { label: 'Email' },
  phone: { label: 'Teléfono' },
  heading: { label: 'Encabezado' },
};

/** Build a valid, empty `CampoFormulario` for the given type. */
export function newField(type: TipoCampo): CampoFormulario {
  const base = {
    id: crypto.randomUUID(),
    type,
    label: '',
    required: type !== 'heading',
  };

  switch (type) {
    case 'select':
    case 'radio':
    case 'checkbox':
      return { ...base, type, options: [''] };
    case 'scale':
      return {
        ...base,
        type,
        min: DEFAULT_SCALE_MIN,
        max: DEFAULT_SCALE_MAX,
      };
    case 'heading':
      return { ...base, type, required: false };
    default:
      return { ...base, type };
  }
}

/** Build a new empty block with a sequential default title. */
export function newBlock(blockNumber?: number): Bloque {
  return {
    id: crypto.randomUUID(),
    titulo: blockNumber != null ? `Bloque ${blockNumber}` : 'Bloque 1',
    fields: [],
  };
}

/** Collect all fields from blocks (when present) or from the flat `fields` array. */
export function getAllFields(def: DefinicionFormulario): CampoFormulario[] {
  if (!def.bloques || def.bloques.length === 0) return def.fields;
  const blockFieldIds = new Set(def.bloques.flatMap((b) => b.fields.map((f) => f.id)));
  const blockFields = def.bloques.flatMap((b) => b.fields);
  const orphanFields = def.fields.filter((f) => !blockFieldIds.has(f.id));
  return [...blockFields, ...orphanFields];
}
