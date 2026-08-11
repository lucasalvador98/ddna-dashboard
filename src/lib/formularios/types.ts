// TypeScript contract for the formularios module (Google Forms-style).
// Mirrors the persisted JSONB `definicion` contract (spec §4) and the
// `respuestas` value contract. Identifiers/comments in English; UI strings
// (labels, errors) are Spanish per DDNA convention.

export type TipoCampo =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'scale'
  | 'email'
  | 'phone'
  | 'heading';

/** Single source of truth for the definition version (kept in sync with defaults.ts). */
export const FORMULARIO_VERSION = 1 as const;
export type VersionFormulario = typeof FORMULARIO_VERSION;

export interface CampoBase {
  id: string;
  type: TipoCampo;
  label: string;
  required: boolean;
  placeholder?: string;
  helpText?: string;
}

export interface CampoOpciones extends CampoBase {
  type: 'select' | 'radio' | 'checkbox';
  options: string[];
}

export interface CampoScale extends CampoBase {
  type: 'scale';
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
}

export interface CampoSimple extends CampoBase {
  type: 'text' | 'textarea' | 'number' | 'date' | 'email' | 'phone';
}

export interface CampoHeading extends CampoBase {
  type: 'heading';
  required: false;
}

export type CampoFormulario = CampoSimple | CampoOpciones | CampoScale | CampoHeading;

/** Field types allowed as a rule source (option/scale types only). */
export type TipoFuenteLogica = 'select' | 'radio' | 'checkbox' | 'scale';

export type OperadorLogico = 'eq' | 'neq';

export interface ReglaLogica {
  /** Source field (select/radio/checkbox/scale). */
  field_id: string;
  op: OperadorLogico;
  /** Matched against the source field answer (string for options, number for scale). */
  value: string | number;
  /** Target fields shown when the rule matches. */
  show_ids: string[];
}

export interface Bloque {
  id: string;
  titulo: string;
  descripcion?: string;
  fields: CampoFormulario[];
}

export interface DefinicionFormulario {
  version: VersionFormulario;
  fields: CampoFormulario[];
  logic: ReglaLogica[];
  bloques?: Bloque[];
}

export interface Formulario {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string | null;
  definicion: DefinicionFormulario;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormularioRespuesta {
  id: string;
  formulario_id: string;
  /** `{ field_id: value }` per the response value contract (spec §4). */
  respuestas: Record<string, unknown>;
  submitted_at: string;
}
