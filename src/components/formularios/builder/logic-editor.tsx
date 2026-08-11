'use client';

// Per-target-field visibility rule editor ("Mostrar este campo si").
// Each row is a rule that includes this field in its `show_ids`; editing a row
// re-points the rule via the pure helpers in src/lib/formularios/builder.ts.
// Rule sources are limited to option/scale fields (excluding self).

import { Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import type { CampoFormulario, OperadorLogico, ReglaLogica, TipoCampo } from '@/lib/formularios/types';
import { FIELD_TYPE_META } from '@/lib/formularios/defaults';
import { addRule, editRule, removeRule } from '@/lib/formularios/builder';
import type { RuleDraft } from '@/lib/formularios/builder';

interface LogicEditorProps {
  targetId: string;
  logic: ReglaLogica[];
  fields: CampoFormulario[];
  onChange: (logic: ReglaLogica[]) => void;
}

const SOURCE_TYPES: ReadonlySet<TipoCampo> = new Set(['select', 'radio', 'checkbox', 'scale']);

const OP_LABELS: Record<OperadorLogico, string> = {
  eq: 'es igual a',
  neq: 'no es igual a',
};

const selectClass =
  'px-2 py-1.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[var(--ddna-blue)] focus:border-transparent';

function defaultValueFor(source: CampoFormulario | undefined): string | number {
  if (!source) return '';
  if (source.type === 'scale') return source.min;
  return isOptionsSource(source) ? source.options[0] ?? '' : '';
}

function isOptionsSource(source: CampoFormulario | undefined): source is CampoFormulario & { type: 'select' | 'radio' | 'checkbox'; options: string[] } {
  return source?.type === 'select' || source?.type === 'radio' || source?.type === 'checkbox';
}

export function LogicEditor({ targetId, logic, fields, onChange }: LogicEditorProps) {
  const sources = fields.filter((field) => SOURCE_TYPES.has(field.type) && field.id !== targetId);
  const rows = logic.filter((rule) => rule.show_ids.includes(targetId));
  const byId = new Map(fields.map((field) => [field.id, field]));

  if (sources.length === 0) return null;

  function handleEdit(rule: ReglaLogica, patch: Partial<RuleDraft>) {
    onChange(
      editRule(logic, targetId, rule, {
        field_id: patch.field_id ?? rule.field_id,
        op: patch.op ?? rule.op,
        value: patch.value ?? rule.value,
      })
    );
  }

  function handleAdd() {
    const first = sources[0];
    onChange(addRule(logic, targetId, { field_id: first.id, op: 'eq', value: defaultValueFor(first) }));
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
        Mostrar este campo si
      </p>
      {rows.length === 0 && (
        <p className="text-xs text-slate-400 mb-2">Sin reglas: el campo siempre se muestra.</p>
      )}

      <div className="space-y-2">
        {rows.map((rule, index) => {
          const source = byId.get(rule.field_id);
          return (
            <div key={index} className="flex items-center gap-2">
              <select
                value={rule.field_id}
                onChange={(e) =>
                  handleEdit(rule, {
                    field_id: e.target.value,
                    value: defaultValueFor(byId.get(e.target.value)),
                  })
                }
                className={clsx(selectClass, 'max-w-[9rem]')}
              >
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label || FIELD_TYPE_META[s.type].label}
                  </option>
                ))}
              </select>

              <select
                value={rule.op}
                onChange={(e) => handleEdit(rule, { op: e.target.value as OperadorLogico })}
                className={clsx(selectClass, 'max-w-[9rem]')}
              >
                <option value="eq">{OP_LABELS.eq}</option>
                <option value="neq">{OP_LABELS.neq}</option>
              </select>

              {source?.type === 'scale' ? (
                <input
                  type="number"
                  value={String(rule.value)}
                  onChange={(e) => handleEdit(rule, { value: Number(e.target.value) })}
                  className={clsx(selectClass, 'w-20')}
                />
              ) : (
                <select
                  value={String(rule.value)}
                  onChange={(e) => handleEdit(rule, { value: e.target.value })}
                  className={clsx(selectClass, 'max-w-[10rem]')}
                >
                  {isOptionsSource(source) &&
                    source.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                </select>
              )}

              <button
                type="button"
                onClick={() => onChange(removeRule(logic, targetId, rule))}
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Quitar regla"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--ddna-blue)] hover:underline"
      >
        <Plus className="w-3.5 h-3.5" />
        Agregar regla
      </button>
    </div>
  );
}
