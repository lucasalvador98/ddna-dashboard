import { describe, it, expect } from 'vitest';
import {
  DEFAULT_SCALE_MAX,
  DEFAULT_SCALE_MIN,
  EMPTY_DEFINICION,
  FIELD_TYPE_META,
  MAX_FIELDS,
  MAX_PAYLOAD_BYTES,
  MAX_RULES,
  newField,
} from './defaults';
import { FORMULARIO_VERSION } from './types';
import type { CampoFormulario, CampoOpciones, CampoScale, TipoCampo } from './types';

const ALL_TYPES: TipoCampo[] = [
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

describe('constants', () => {
  it('exposes the expected limits', () => {
    expect(MAX_FIELDS).toBe(100);
    expect(MAX_RULES).toBe(50);
    expect(MAX_PAYLOAD_BYTES).toBe(65536);
  });

  it('exposes scale defaults of 1-5', () => {
    expect(DEFAULT_SCALE_MIN).toBe(1);
    expect(DEFAULT_SCALE_MAX).toBe(5);
  });
});

describe('EMPTY_DEFINICION', () => {
  it('is a versioned empty definition', () => {
    expect(EMPTY_DEFINICION).toEqual({ version: 1, fields: [], logic: [] });
    expect(EMPTY_DEFINICION.version).toBe(FORMULARIO_VERSION);
  });
});

describe('FIELD_TYPE_META', () => {
  it('provides a Spanish label for every field type', () => {
    for (const type of ALL_TYPES) {
      expect(typeof FIELD_TYPE_META[type].label).toBe('string');
      expect(FIELD_TYPE_META[type].label.length).toBeGreaterThan(0);
    }
    expect(FIELD_TYPE_META.text.label).toBe('Texto');
    expect(FIELD_TYPE_META.scale.label).toBe('Escala');
  });
});

describe('newField', () => {
  it('returns a valid field shape for every type', () => {
    for (const type of ALL_TYPES) {
      const field = newField(type);
      expect(field.id).toBeTruthy();
      expect(field.type).toBe(type);
      expect(field.label).toBe('');
    }
  });

  it('creates unique ids per call', () => {
    const ids = new Set(ALL_TYPES.map((type) => newField(type).id));
    expect(ids.size).toBe(ALL_TYPES.length);
  });

  it('sets required false for heading and true otherwise', () => {
    expect(newField('heading').required).toBe(false);
    expect(newField('text').required).toBe(true);
    expect(newField('select').required).toBe(true);
  });

  it('seeds option fields with a single empty option', () => {
    for (const type of ['select', 'radio', 'checkbox'] as const) {
      const field = newField(type) as CampoOpciones;
      expect(field.options).toEqual(['']);
    }
  });

  it('seeds scale fields with 1-5 defaults', () => {
    const field = newField('scale') as CampoScale;
    expect(field.min).toBe(1);
    expect(field.max).toBe(5);
  });

  it('returns a heading without min/max/options', () => {
    const field = newField('heading') as CampoFormulario;
    expect('options' in field).toBe(false);
    expect('min' in field).toBe(false);
  });
});
