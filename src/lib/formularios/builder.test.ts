import { describe, it, expect } from 'vitest';
import {
  addField,
  addRule,
  editRule,
  moveField,
  removeField,
  removeRule,
  updateField,
  updateOptions,
  updateScale,
} from './builder';
import { MAX_FIELDS, MAX_RULES } from './defaults';
import { validateDefinition } from './validation';
import type { DefinicionFormulario } from './types';

function makeDef(fields: DefinicionFormulario['fields'], logic: DefinicionFormulario['logic'] = []): DefinicionFormulario {
  return { version: 1, fields, logic };
}

const PROVINCIA = { id: 'provincia', type: 'select' as const, label: 'Provincia', required: true, options: ['Córdoba', 'Buenos Aires'] };
const MUNICIPIO = { id: 'municipio', type: 'text' as const, label: 'Municipio', required: false };

describe('builder field helpers', () => {
  it('adds a field of the requested type with defaults', () => {
    const def = addField(makeDef([]), 'select');
    expect(def.fields).toHaveLength(1);
    expect(def.fields[0]).toMatchObject({ type: 'select', required: true, options: [''] });
  });

  it('forces required=false on added headings', () => {
    const def = addField(makeDef([]), 'heading');
    expect(def.fields[0].required).toBe(false);
  });

  it('merges a patch onto an existing field', () => {
    const def = updateField(makeDef([PROVINCIA]), 'provincia', { label: 'Origen' });
    expect(def.fields[0].label).toBe('Origen');
  });

  it('replaces the options list', () => {
    const def = updateOptions(makeDef([PROVINCIA]), 'provincia', ['A', 'B', 'C']);
    expect(def.fields[0]).toMatchObject({ options: ['A', 'B', 'C'] });
  });

  it('updates scale min/max and labels', () => {
    const def = updateScale(makeDef([{ id: 'nivel', type: 'scale' as const, label: 'Nivel', required: false, min: 1, max: 5 }]), 'nivel', { min: 0, max: 10, minLabel: 'Nada', maxLabel: 'Mucho' });
    expect(def.fields[0]).toMatchObject({ min: 0, max: 10, minLabel: 'Nada', maxLabel: 'Mucho' });
  });

  it('moves a field down and up', () => {
    const def = makeDef([PROVINCIA, MUNICIPIO]);
    const down = moveField(def, 'provincia', 1);
    expect(down.fields.map((f) => f.id)).toEqual(['municipio', 'provincia']);
    const up = moveField(down, 'provincia', -1);
    expect(up.fields.map((f) => f.id)).toEqual(['provincia', 'municipio']);
  });

  it('ignores moves beyond array boundaries', () => {
    const def = makeDef([PROVINCIA, MUNICIPIO]);
    expect(moveField(def, 'provincia', -1)).toBe(def);
    expect(moveField(def, 'municipio', 1)).toBe(def);
  });

  it('removes a field and its rules (source and target)', () => {
    const def = makeDef(
      [PROVINCIA, MUNICIPIO],
      [{ field_id: 'provincia', op: 'eq', value: 'Córdoba', show_ids: ['municipio', 'provincia'] }]
    );
    const cleaned = removeField(def, 'provincia');
    expect(cleaned.fields.map((f) => f.id)).toEqual(['municipio']);
    expect(cleaned.logic).toEqual([]);
  });
});

describe('builder rule helpers', () => {
  it('creates a new rule when the source/op/value combo does not exist', () => {
    const logic = addRule([], 'municipio', { field_id: 'provincia', op: 'eq', value: 'Córdoba' });
    expect(logic).toEqual([{ field_id: 'provincia', op: 'eq', value: 'Córdoba', show_ids: ['municipio'] }]);
  });

  it('appends the target to an existing rule with the same combo', () => {
    const base: DefinicionFormulario['logic'] = [
      { field_id: 'provincia', op: 'eq', value: 'Córdoba', show_ids: ['municipio'] },
    ];
    const logic = addRule(base, 'cp', { field_id: 'provincia', op: 'eq', value: 'Córdoba' });
    expect(logic[0].show_ids).toEqual(['municipio', 'cp']);
  });

  it('removes the target from a rule and deletes it when empty', () => {
    const base: DefinicionFormulario['logic'] = [
      { field_id: 'provincia', op: 'eq', value: 'Córdoba', show_ids: ['municipio', 'cp'] },
    ];
    const logic = removeRule(base, 'municipio', base[0]);
    expect(logic[0].show_ids).toEqual(['cp']);
    const empty = removeRule(logic, 'cp', logic[0]);
    expect(empty).toEqual([]);
  });

  it('re-points a rule to a new source keeping its other targets intact', () => {
    const base: DefinicionFormulario['logic'] = [
      { field_id: 'provincia', op: 'eq', value: 'Córdoba', show_ids: ['municipio', 'cp'] },
    ];
    const logic = editRule(base, 'municipio', base[0], { field_id: 'pais', op: 'neq', value: 'Chile' });
    expect(logic).toHaveLength(2);
    expect(logic[0]).toMatchObject({ field_id: 'provincia', op: 'eq', value: 'Córdoba', show_ids: ['cp'] });
    expect(logic[1]).toMatchObject({ field_id: 'pais', op: 'neq', value: 'Chile', show_ids: ['municipio'] });
  });
});

describe('builder limits against validateDefinition', () => {
  it('rejects more than MAX_FIELDS fields', () => {
    const fields = Array.from({ length: MAX_FIELDS + 1 }, (_, i) => ({
      id: `f${i}`,
      type: 'text' as const,
      label: `Campo ${i}`,
      required: false,
    }));
    const result = validateDefinition(makeDef(fields));
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain(`${MAX_FIELDS}`);
  });

  it('rejects more than MAX_RULES rules', () => {
    const fields = [
      { id: 'provincia', type: 'select' as const, label: 'Provincia', required: true, options: ['A', 'B'] },
      { id: 'municipio', type: 'text' as const, label: 'Municipio', required: false },
    ];
    const logic = Array.from({ length: MAX_RULES + 1 }, (_, i) => ({
      field_id: 'provincia',
      op: 'eq' as const,
      value: i % 2 === 0 ? 'A' : 'B',
      show_ids: ['municipio'],
    }));
    const result = validateDefinition(makeDef(fields, logic));
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain(`${MAX_RULES}`);
  });

  it('accepts a definition built through builder helpers', () => {
    let def = makeDef([]);
    def = addField(def, 'select');
    def = updateField(def, def.fields[0].id, { label: 'Provincia', options: ['Córdoba', 'Buenos Aires'] });
    def = addField(def, 'text');
    const target = def.fields[1].id;
    def = updateField(def, target, { label: 'Municipio' });
    def = addField(def, 'text');
    def = updateField(def, def.fields[2].id, { label: 'Otro' });
    def = { ...def, logic: addRule(def.logic, target, { field_id: def.fields[0].id, op: 'eq', value: 'Córdoba' }) };
    expect(validateDefinition(def).valid).toBe(true);
  });
});
