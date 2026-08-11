// Defaults and limits for the formularios module.
// Identifiers/comments in English; field type labels are Spanish (DDNA convention).

import { FORMULARIO_VERSION } from './types';
import type { CampoFormulario, DefinicionFormulario, TipoCampo } from './types';

export const MAX_FIELDS = 100;
export const MAX_RULES = 50;
export const MAX_PAYLOAD_BYTES = 65536;
export const DEFAULT_SCALE_MIN = 1;
export const DEFAULT_SCALE_MAX = 5;

export const EMPTY_DEFINICION: DefinicionFormulario = {
  version: FORMULARIO_VERSION,
  fields: [],
  logic: [],
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
