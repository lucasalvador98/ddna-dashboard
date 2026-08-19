// Pure, immutable state helpers for the admin builder (PR2b).
// Each helper returns a NEW definition/logic array; the builder client holds
// the definition in React state and applies these helpers on every edit.
// Identifiers/comments in English; UI-facing strings live in the components.

import { newField, newBlock } from './defaults';
import type {
  Bloque,
  CampoFormulario,
  DefinicionFormulario,
  OperadorLogico,
  ReglaLogica,
  TipoCampo,
} from './types';

/** Draft of a visibility rule as edited per target field. */
export interface RuleDraft {
  field_id: string;
  op: OperadorLogico;
  value: string | number;
}

export function addField(def: DefinicionFormulario, type: TipoCampo): DefinicionFormulario {
  return { ...def, fields: [...def.fields, newField(type)] };
}

export function updateField(
  def: DefinicionFormulario,
  id: string,
  patch: Partial<CampoFormulario>
): DefinicionFormulario {
  return {
    ...def,
    fields: def.fields.map((field) =>
      field.id === id ? ({ ...field, ...patch } as CampoFormulario) : field
    ),
  };
}

/** Shortcuts for option/scale properties, kept for intent clarity in the UI. */
export function updateOptions(
  def: DefinicionFormulario,
  id: string,
  options: string[]
): DefinicionFormulario {
  return updateField(def, id, { options });
}

export function updateScale(
  def: DefinicionFormulario,
  id: string,
  patch: { min?: number; max?: number; minLabel?: string; maxLabel?: string }
): DefinicionFormulario {
  return updateField(def, id, patch);
}

/** Remove a field and every rule that references it (as source or target). */
export function removeField(def: DefinicionFormulario, id: string): DefinicionFormulario {
  return {
    ...def,
    fields: def.fields.filter((field) => field.id !== id),
    logic: def.logic
      .map((rule) => ({ ...rule, show_ids: rule.show_ids.filter((target) => target !== id) }))
      .filter((rule) => rule.field_id !== id && rule.show_ids.length > 0),
  };
}

/** Move a field up (-1) or down (1); no-op at array boundaries. */
export function moveField(def: DefinicionFormulario, id: string, dir: -1 | 1): DefinicionFormulario {
  const index = def.fields.findIndex((field) => field.id === id);
  const target = index + dir;
  if (index < 0 || target < 0 || target >= def.fields.length) return def;
  const fields = [...def.fields];
  [fields[index], fields[target]] = [fields[target], fields[index]];
  return { ...def, fields };
}

/**
 * Append `target` to an existing rule with the same (source, op, value), else
 * create a new rule targeting it. Keeps the "OR-per-field" invariant: a field
 * appears in at most one rule per (source, op, value) combination.
 */
export function addRule(logic: ReglaLogica[], target: string, draft: RuleDraft): ReglaLogica[] {
  const existing = logic.find(
    (rule) => rule.field_id === draft.field_id && rule.op === draft.op && rule.value === draft.value
  );
  if (existing) {
    if (existing.show_ids.includes(target)) return logic;
    return logic.map((rule) =>
      rule === existing ? { ...rule, show_ids: [...rule.show_ids, target] } : rule
    );
  }
  return [...logic, { ...draft, show_ids: [target] }];
}

/** Remove `target` from a rule, deleting the rule when it has no targets left. */
export function removeRule(logic: ReglaLogica[], target: string, rule: ReglaLogica): ReglaLogica[] {
  const show_ids = rule.show_ids.filter((id) => id !== target);
  if (show_ids.length === 0) return logic.filter((r) => r !== rule);
  return logic.map((r) => (r === rule ? { ...r, show_ids } : r));
}

/** Re-point a rule row (source/op/value) that targets `target`. */
export function editRule(logic: ReglaLogica[], target: string, rule: ReglaLogica, draft: RuleDraft): ReglaLogica[] {
  const withoutTarget = removeRule(logic, target, rule);
  return addRule(withoutTarget, target, draft);
}

// ---------------------------------------------------------------- block helpers

export function addBlock(def: DefinicionFormulario): DefinicionFormulario {
  const bloques = def.bloques ?? [];
  return { ...def, bloques: [...bloques, newBlock(bloques.length + 1)] };
}

export function updateBlock(def: DefinicionFormulario, blockId: string, patch: Partial<Bloque>): DefinicionFormulario {
  if (!def.bloques) return def;
  return {
    ...def,
    bloques: def.bloques.map((b) => (b.id === blockId ? { ...b, ...patch } : b)),
  };
}

export function removeBlock(def: DefinicionFormulario, blockId: string): DefinicionFormulario {
  if (!def.bloques) return def;
  const block = def.bloques.find((b) => b.id === blockId);
  if (!block) return def;
  let updated = { ...def };
  for (const field of block.fields) {
    updated = removeField(updated, field.id);
  }
  return { ...updated, bloques: updated.bloques!.filter((b) => b.id !== blockId) };
}

export function moveBlock(def: DefinicionFormulario, blockId: string, dir: -1 | 1): DefinicionFormulario {
  if (!def.bloques) return def;
  const index = def.bloques.findIndex((b) => b.id === blockId);
  const target = index + dir;
  if (index < 0 || target < 0 || target >= def.bloques.length) return def;
  const bloques = [...def.bloques];
  [bloques[index], bloques[target]] = [bloques[target], bloques[index]];
  return { ...def, bloques };
}

export function addFieldToBlock(def: DefinicionFormulario, blockId: string, type: TipoCampo): DefinicionFormulario {
  if (!def.bloques) return def;
  const block = def.bloques.find((b) => b.id === blockId);
  if (!block) return def;
  const field = newField(type);
  return {
    ...def,
    bloques: def.bloques.map((b) =>
      b.id === blockId ? { ...b, fields: [...b.fields, field] } : b
    ),
  };
}

export function updateFieldInBlock(
  def: DefinicionFormulario,
  blockId: string,
  fieldId: string,
  patch: Partial<CampoFormulario>
): DefinicionFormulario {
  if (!def.bloques) return def;
  return {
    ...def,
    bloques: def.bloques.map((b) =>
      b.id === blockId
        ? {
            ...b,
            fields: b.fields.map((f) =>
              f.id === fieldId ? ({ ...f, ...patch } as CampoFormulario) : f
            ),
          }
        : b
    ),
  };
}

export function removeFieldFromBlock(def: DefinicionFormulario, blockId: string, fieldId: string): DefinicionFormulario {
  if (!def.bloques) return def;
  const updated = {
    ...def,
    logic: def.logic
      .map((rule) => ({ ...rule, show_ids: rule.show_ids.filter((target) => target !== fieldId) }))
      .filter((rule) => rule.field_id !== fieldId && rule.show_ids.length > 0),
  };
  return {
    ...updated,
    bloques: updated.bloques!.map((b) =>
      b.id === blockId ? { ...b, fields: b.fields.filter((f) => f.id !== fieldId) } : b
    ),
  };
}

export function moveFieldInBlock(def: DefinicionFormulario, blockId: string, fieldId: string, dir: -1 | 1): DefinicionFormulario {
  if (!def.bloques) return def;
  const block = def.bloques.find((b) => b.id === blockId);
  if (!block) return def;
  const index = block.fields.findIndex((f) => f.id === fieldId);
  const target = index + dir;
  if (index < 0 || target < 0 || target >= block.fields.length) return def;
  const fields = [...block.fields];
  [fields[index], fields[target]] = [fields[target], fields[index]];
  return {
    ...def,
    bloques: def.bloques.map((b) => (b.id === blockId ? { ...b, fields } : b)),
  };
}

export function updateOptionsInBlock(def: DefinicionFormulario, blockId: string, fieldId: string, options: string[]): DefinicionFormulario {
  return updateFieldInBlock(def, blockId, fieldId, { options });
}

export function updateScaleInBlock(
  def: DefinicionFormulario,
  blockId: string,
  fieldId: string,
  patch: { min?: number; max?: number; minLabel?: string; maxLabel?: string }
): DefinicionFormulario {
  return updateFieldInBlock(def, blockId, fieldId, patch);
}
