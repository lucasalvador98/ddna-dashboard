import { describe, it, expect } from 'vitest';
import { evaluateLogic } from './logic';
import type { DefinicionFormulario } from './types';

function makeDef(overrides: Partial<DefinicionFormulario> = {}): DefinicionFormulario {
  return {
    version: 1,
    fields: [
      { id: 'provincia', type: 'select', label: 'Provincia', required: true, options: ['Córdoba', 'Buenos Aires'] },
      { id: 'municipio', type: 'text', label: 'Municipio', required: false },
      { id: 'edad', type: 'scale', label: 'Edad', required: false, min: 1, max: 5 },
    ],
    logic: [
      { field_id: 'provincia', op: 'eq', value: 'Córdoba', show_ids: ['municipio'] },
    ],
    ...overrides,
  };
}

describe('evaluateLogic', () => {
  it('returns an empty set for a definition without fields', () => {
    const visible = evaluateLogic({ version: 1, fields: [], logic: [] }, {});
    expect(visible.size).toBe(0);
  });

  it('shows every field when there are no rules', () => {
    const def = makeDef({ logic: [] });
    const visible = evaluateLogic(def, {});
    expect([...visible].sort()).toEqual(['edad', 'municipio', 'provincia']);
  });

  it('hides a conditional target until its eq rule matches (spec scenario 1)', () => {
    const def = makeDef();
    expect(evaluateLogic(def, {}).has('municipio')).toBe(false);
    expect(evaluateLogic(def, { provincia: 'Buenos Aires' }).has('municipio')).toBe(false);
    expect(evaluateLogic(def, { provincia: 'Córdoba' }).has('municipio')).toBe(true);
  });

  it('reveals a conditional target on neq match and hides it when equal', () => {
    const def = makeDef({
      logic: [{ field_id: 'provincia', op: 'neq', value: 'Buenos Aires', show_ids: ['municipio'] }],
    });
    expect(evaluateLogic(def, { provincia: 'Córdoba' }).has('municipio')).toBe(true);
    expect(evaluateLogic(def, { provincia: 'Buenos Aires' }).has('municipio')).toBe(false);
  });

  it('never matches a rule when the source field is unanswered', () => {
    const eqDef = makeDef();
    const neqDef = makeDef({
      logic: [{ field_id: 'provincia', op: 'neq', value: 'Buenos Aires', show_ids: ['municipio'] }],
    });
    expect(evaluateLogic(eqDef, { provincia: '' }).has('municipio')).toBe(false);
    expect(evaluateLogic(neqDef, {}).has('municipio')).toBe(false);
  });

  it('applies OR-per-field semantics across rules targeting the same field', () => {
    const def = makeDef({
      logic: [
        { field_id: 'provincia', op: 'eq', value: 'Córdoba', show_ids: ['municipio'] },
        { field_id: 'edad', op: 'eq', value: 5, show_ids: ['municipio'] },
      ],
    });
    expect(evaluateLogic(def, { provincia: 'Córdoba' }).has('municipio')).toBe(true);
    expect(evaluateLogic(def, { edad: 5 }).has('municipio')).toBe(true);
    expect(evaluateLogic(def, { provincia: 'Buenos Aires', edad: 3 }).has('municipio')).toBe(false);
  });

  it('keeps rule source fields always visible', () => {
    const def = makeDef();
    const visible = evaluateLogic(def, { provincia: 'Buenos Aires' });
    expect(visible.has('provincia')).toBe(true);
    expect(visible.has('edad')).toBe(true);
  });

  it('shows multiple targets of a single matching rule together', () => {
    const def = makeDef({
      fields: [
        { id: 'provincia', type: 'select', label: 'Provincia', required: true, options: ['Córdoba', 'Buenos Aires'] },
        { id: 'municipio', type: 'text', label: 'Municipio', required: false },
        { id: 'codigo', type: 'text', label: 'Código', required: false },
      ],
      logic: [{ field_id: 'provincia', op: 'eq', value: 'Córdoba', show_ids: ['municipio', 'codigo'] }],
    });
    const visible = evaluateLogic(def, { provincia: 'Córdoba' });
    expect(visible.has('municipio')).toBe(true);
    expect(visible.has('codigo')).toBe(true);
    const hidden = evaluateLogic(def, { provincia: 'Buenos Aires' });
    expect(hidden.has('municipio')).toBe(false);
    expect(hidden.has('codigo')).toBe(false);
  });

  it('compares scale (number) rule values with strict equality', () => {
    const def = makeDef({
      logic: [{ field_id: 'edad', op: 'eq', value: 5, show_ids: ['municipio'] }],
    });
    expect(evaluateLogic(def, { edad: 5 }).has('municipio')).toBe(true);
    expect(evaluateLogic(def, { edad: 4 }).has('municipio')).toBe(false);
  });
});
