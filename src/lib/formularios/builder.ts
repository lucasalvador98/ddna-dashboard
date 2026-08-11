// Pure, immutable state helpers for the admin builder (PR2b).
// Each helper returns a NEW definition/logic array; the builder client holds
// the definition in React state and applies these helpers on every edit.
// Identifiers/comments in English; UI-facing strings live in the components.

import { newField } from './defaults';
import type {
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
