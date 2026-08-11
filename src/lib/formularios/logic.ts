// Conditional logic evaluator for the formularios module.
// Pure function shared by the builder preview, the public renderer and the
// server-side submit validation.

import type { DefinicionFormulario, ReglaLogica } from './types';

function ruleMatches(rule: ReglaLogica, answers: Record<string, unknown>): boolean {
  const answer = answers[rule.field_id];
  // Unanswered source field -> the rule never matches (for both eq and neq).
  if (answer === undefined || answer === null || answer === '') {
    return false;
  }
  if (rule.op === 'eq') {
    return answer === rule.value;
  }
  return answer !== rule.value;
}

/**
 * Compute the set of visible field ids for a definition and a set of answers.
 *
 * Semantics (v1):
 * - Every field is visible by default.
 * - A field that appears in ANY rule's `show_ids` is conditional: it is visible
 *   iff at least one matching rule targets it (OR-per-field).
 * - A rule matches iff `answers[field_id] === rule.value` (eq) or `!==` (neq).
 * - Rule source fields are always visible (no cascading, no circular logic).
 */
export function evaluateLogic(
  def: DefinicionFormulario,
  answers: Record<string, unknown>
): Set<string> {
  const visible = new Set(def.fields.map((field) => field.id));
  const conditionalTargets = new Set(def.logic.flatMap((rule) => rule.show_ids));

  for (const target of conditionalTargets) {
    const shown = def.logic.some(
      (rule) => rule.show_ids.includes(target) && ruleMatches(rule, answers)
    );
    if (!shown) {
      visible.delete(target);
    }
  }

  return visible;
}
