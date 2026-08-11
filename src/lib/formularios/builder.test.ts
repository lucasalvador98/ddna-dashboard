import { describe, it, expect } from 'vitest';
import {
  addBlock,
  addField,
  addFieldToBlock,
  addRule,
  editRule,
  moveBlock,
  moveField,
  moveFieldInBlock,
  removeBlock,
  removeField,
  removeFieldFromBlock,
  removeRule,
  updateBlock,
  updateField,
  updateFieldInBlock,
  updateOptions,
  updateOptionsInBlock,
  updateScale,
  updateScaleInBlock,
} from './builder';
import { MAX_FIELDS, MAX_RULES, getAllFields } from './defaults';
import { validateDefinition } from './validation';
import type { DefinicionFormulario } from './types';

function makeDef(fields: DefinicionFormulario['fields'], logic: DefinicionFormulario['logic'] = [], bloques?: DefinicionFormulario['bloques']): DefinicionFormulario {
  return { version: 1, fields, logic, bloques };
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

describe('builder block helpers', () => {
  it('addBlock inserts a new block with sequential title', () => {
    const def = makeDef([]);
    const result = addBlock(def);
    expect(result.bloques).toHaveLength(1);
    expect(result.bloques![0].titulo).toBe('Bloque 1');
    expect(result.bloques![0].fields).toEqual([]);
    const result2 = addBlock(result);
    expect(result2.bloques).toHaveLength(2);
    expect(result2.bloques![1].titulo).toBe('Bloque 2');
  });

  it('addBlock initializes bloques on a definition without them', () => {
    const def = { version: 1 as const, fields: [], logic: [] };
    const result = addBlock(def);
    expect(result.bloques).toHaveLength(1);
  });

  it('updateBlock patches a block title and description', () => {
    let def = addBlock(makeDef([]));
    const blockId = def.bloques![0].id;
    def = updateBlock(def, blockId, { titulo: 'Información personal', descripcion: 'Datos básicos' });
    expect(def.bloques![0].titulo).toBe('Información personal');
    expect(def.bloques![0].descripcion).toBe('Datos básicos');
  });

  it('updateBlock is a no-op when bloques is undefined', () => {
    const def = makeDef([]);
    const result = updateBlock(def, 'missing', { titulo: 'X' });
    expect(result).toBe(def);
  });

  it('removeBlock deletes the block and cleans up its fields from logic', () => {
    let def = addBlock(makeDef([]));
    const blockId = def.bloques![0].id;
    def = addFieldToBlock(def, blockId, 'select');
    const fieldId = def.bloques![0].fields[0].id;
    def = updateFieldInBlock(def, blockId, fieldId, { label: 'Provincia', options: ['A'] });
    def = { ...def, logic: addRule(def.logic, fieldId, { field_id: fieldId, op: 'eq', value: 'A' }) };
    expect(def.logic).toHaveLength(1);

    def = removeBlock(def, blockId);
    expect(def.bloques).toHaveLength(0);
    expect(def.logic).toEqual([]);
  });

  it('removeBlock is a no-op when bloques is undefined', () => {
    const def = makeDef([]);
    const result = removeBlock(def, 'missing');
    expect(result).toBe(def);
  });

  it('removeBlock is a no-op when block not found', () => {
    const def = addBlock(makeDef([]));
    const result = removeBlock(def, 'missing');
    expect(result.bloques).toHaveLength(1);
  });

  it('moveBlock reorders blocks up and down', () => {
    let def = addBlock(makeDef([]));
    def = addBlock(def);
    expect(def.bloques!.map((b) => b.titulo)).toEqual(['Bloque 1', 'Bloque 2']);

    def = moveBlock(def, def.bloques![0].id, 1);
    expect(def.bloques!.map((b) => b.titulo)).toEqual(['Bloque 2', 'Bloque 1']);

    def = moveBlock(def, def.bloques![1].id, -1);
    expect(def.bloques!.map((b) => b.titulo)).toEqual(['Bloque 1', 'Bloque 2']);
  });

  it('moveBlock ignores moves beyond boundaries', () => {
    let def = addBlock(makeDef([]));
    def = addBlock(def);
    const first = def.bloques![0].id;
    const last = def.bloques![1].id;
    expect(moveBlock(def, first, -1)).toBe(def);
    expect(moveBlock(def, last, 1)).toBe(def);
  });

  it('moveBlock is a no-op when bloques is undefined', () => {
    const def = makeDef([]);
    expect(moveBlock(def, 'id', 1)).toBe(def);
  });

  it('addFieldToBlock adds a field to the specified block', () => {
    let def = addBlock(makeDef([]));
    const blockId = def.bloques![0].id;
    def = addFieldToBlock(def, blockId, 'text');
    expect(def.bloques![0].fields).toHaveLength(1);
    expect(def.bloques![0].fields[0].type).toBe('text');
  });

  it('addFieldToBlock is a no-op when bloques is undefined', () => {
    const def = makeDef([]);
    expect(addFieldToBlock(def, 'id', 'text')).toBe(def);
  });

  it('addFieldToBlock is a no-op when block not found', () => {
    const def = addBlock(makeDef([]));
    const result = addFieldToBlock(def, 'missing', 'text');
    expect(result.bloques![0].fields).toHaveLength(0);
  });

  it('updateFieldInBlock patches a field inside a block', () => {
    let def = addBlock(makeDef([]));
    const blockId = def.bloques![0].id;
    def = addFieldToBlock(def, blockId, 'text');
    const fieldId = def.bloques![0].fields[0].id;
    def = updateFieldInBlock(def, blockId, fieldId, { label: 'Nombre', required: true });
    expect(def.bloques![0].fields[0].label).toBe('Nombre');
  });

  it('updateFieldInBlock is a no-op when bloques is undefined', () => {
    const def = makeDef([]);
    expect(updateFieldInBlock(def, 'bid', 'fid', { label: 'X' })).toBe(def);
  });

  it('removeFieldFromBlock removes the field and cleans up logic', () => {
    let def = addBlock(makeDef([]));
    const blockId = def.bloques![0].id;
    def = addFieldToBlock(def, blockId, 'select');
    const fieldId = def.bloques![0].fields[0].id;
    def = updateFieldInBlock(def, blockId, fieldId, { label: 'Provincia', options: ['A', 'B'] });
    def = { ...def, logic: addRule(def.logic, fieldId, { field_id: fieldId, op: 'eq', value: 'A' }) };

    def = removeFieldFromBlock(def, blockId, fieldId);
    expect(def.bloques![0].fields).toHaveLength(0);
    expect(def.logic).toEqual([]);
  });

  it('removeFieldFromBlock is a no-op when bloques is undefined', () => {
    const def = makeDef([]);
    expect(removeFieldFromBlock(def, 'bid', 'fid')).toBe(def);
  });

  it('moveFieldInBlock reorders fields within a block', () => {
    let def = addBlock(makeDef([]));
    const blockId = def.bloques![0].id;
    def = addFieldToBlock(def, blockId, 'text');
    const f1 = def.bloques![0].fields[0].id;
    def = addFieldToBlock(def, blockId, 'text');
    const f2 = def.bloques![0].fields[1].id;

    def = moveFieldInBlock(def, blockId, f1, 1);
    expect(def.bloques![0].fields.map((f) => f.id)).toEqual([f2, f1]);
    def = moveFieldInBlock(def, blockId, f1, -1);
    expect(def.bloques![0].fields.map((f) => f.id)).toEqual([f1, f2]);
  });

  it('moveFieldInBlock ignores moves beyond boundaries', () => {
    let def = addBlock(makeDef([]));
    const blockId = def.bloques![0].id;
    def = addFieldToBlock(def, blockId, 'text');
    const fid = def.bloques![0].fields[0].id;
    expect(moveFieldInBlock(def, blockId, fid, -1)).toBe(def);
    expect(moveFieldInBlock(def, blockId, fid, 1)).toBe(def);
  });

  it('moveFieldInBlock is a no-op when bloques is undefined', () => {
    const def = makeDef([]);
    expect(moveFieldInBlock(def, 'bid', 'fid', 1)).toBe(def);
  });

  it('updateOptionsInBlock delegates to updateFieldInBlock', () => {
    let def = addBlock(makeDef([]));
    const blockId = def.bloques![0].id;
    def = addFieldToBlock(def, blockId, 'select');
    const fieldId = def.bloques![0].fields[0].id;
    def = updateOptionsInBlock(def, blockId, fieldId, ['A', 'B']);
    expect(def.bloques![0].fields[0]).toMatchObject({ options: ['A', 'B'] });
  });

  it('updateScaleInBlock delegates to updateFieldInBlock', () => {
    let def = addBlock(makeDef([]));
    const blockId = def.bloques![0].id;
    def = addFieldToBlock(def, blockId, 'scale');
    const fieldId = def.bloques![0].fields[0].id;
    def = updateScaleInBlock(def, blockId, fieldId, { min: 0, max: 10 });
    expect(def.bloques![0].fields[0]).toMatchObject({ min: 0, max: 10 });
  });

  it('validates a block-based definition built through helpers', () => {
    let def = makeDef([]);
    def = addBlock(def);
    const blockId = def.bloques![0].id;
    def = updateBlock(def, blockId, { titulo: 'Info personal' });
    def = addFieldToBlock(def, blockId, 'text');
    def = updateFieldInBlock(def, blockId, def.bloques![0].fields[0].id, { label: 'Nombre' });
    def = addFieldToBlock(def, blockId, 'select');
    const targetId = def.bloques![0].fields[1].id;
    def = updateFieldInBlock(def, blockId, targetId, { label: 'Provincia', options: ['A', 'B'] });
    def = { ...def, logic: addRule(def.logic, targetId, { field_id: targetId, op: 'eq', value: 'A' }) };
    expect(validateDefinition(def).valid).toBe(true);
  });
});

describe('getAllFields', () => {
  it('returns flat fields when no blocks', () => {
    const def = makeDef([PROVINCIA, MUNICIPIO]);
    expect(getAllFields(def).map((f) => f.id)).toEqual(['provincia', 'municipio']);
  });

  it('returns flat fields when bloques is empty', () => {
    const def = makeDef([PROVINCIA], [], []);
    expect(getAllFields(def).map((f) => f.id)).toEqual(['provincia']);
  });

  it('returns block fields when blocks are present', () => {
    let def = makeDef([]);
    def = addBlock(def);
    const blockId = def.bloques![0].id;
    def = addFieldToBlock(def, blockId, 'text');
    const fid = def.bloques![0].fields[0].id;
    def = updateFieldInBlock(def, blockId, fid, { label: 'Nombre' });
    expect(getAllFields(def).map((f) => f.id)).toEqual([fid]);
  });

  it('includes orphan fields at the end', () => {
    let def = makeDef([MUNICIPIO]);
    def = addBlock(def);
    const blockId = def.bloques![0].id;
    def = addFieldToBlock(def, blockId, 'text');
    const fid = def.bloques![0].fields[0].id;
    def = updateFieldInBlock(def, blockId, fid, { label: 'Nombre' });
    const result = getAllFields(def);
    expect(result.map((f) => f.id)).toEqual([fid, 'municipio']);
  });
});
