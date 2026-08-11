'use client';

// Shared form renderer used by BOTH the builder preview (PR2b) and the public
// view (PR3). Browser-safe (no supabase import). Manages answer/error state,
// re-evaluates conditional logic on every change and clears answers of fields
// that become hidden. Supports block-based sections (Google Forms-style) and
// flat rendering for backward compatibility. UI strings in Spanish.

import { useState } from 'react';
import clsx from 'clsx';
import type { CampoFormulario, DefinicionFormulario } from '@/lib/formularios/types';
import { evaluateLogic } from '@/lib/formularios/logic';
import { getAllFields } from '@/lib/formularios/defaults';
import { FieldInput, fieldError } from './fields';

interface FormRendererProps {
  definicion: DefinicionFormulario;
  titulo: string;
  descripcion?: string | null;
  /** Initial answers (e.g. builder draft). Only visible fields are rendered. */
  initialAnswers?: Record<string, unknown>;
  /** When provided, renders a submit button that receives the validated answers. */
  onSubmit?: (answers: Record<string, unknown>) => Promise<void>;
  submitLabel?: string;
  /** Preview mode (builder): no submit button and no required/format errors. */
  preview?: boolean;
}

function hasBlocks(def: DefinicionFormulario): boolean {
  return Boolean(def.bloques && def.bloques.length > 0);
}

function renderField(
  field: CampoFormulario,
  visible: Set<string>,
  answers: Record<string, unknown>,
  errors: Record<string, string>,
  preview: boolean,
  handleChange: (fieldId: string, value: unknown) => void
) {
  if (!visible.has(field.id)) return null;

  return (
    <div key={field.id}>
      {field.type !== 'heading' && (
        <label htmlFor={field.id} className="block text-sm font-medium text-slate-700 mb-1">
          {field.label}
          {field.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <FieldInput
        field={field}
        value={answers[field.id]}
        onChange={(v) => handleChange(field.id, v)}
        error={errors[field.id]}
      />
      {field.helpText && <p className="text-xs text-slate-400 mt-1">{field.helpText}</p>}
      {errors[field.id] && !preview && (
        <p className="text-xs text-red-500 mt-1">{errors[field.id]}</p>
      )}
    </div>
  );
}

export function FormRenderer({
  definicion,
  titulo,
  descripcion,
  initialAnswers,
  onSubmit,
  submitLabel = 'Enviar',
  preview = false,
}: FormRendererProps) {
  const [answers, setAnswers] = useState<Record<string, unknown>>(initialAnswers ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const visible = evaluateLogic(definicion, answers);

  const blockFieldIds = hasBlocks(definicion)
    ? new Set(definicion.bloques!.flatMap((b) => b.fields.map((f) => f.id)))
    : null;

  const orphanFields =
    blockFieldIds
      ? definicion.fields.filter((f) => !blockFieldIds.has(f.id))
      : null;

  function handleChange(fieldId: string, value: unknown) {
    setAnswers((prev) => {
      const next = { ...prev, [fieldId]: value };
      const newVisible = evaluateLogic(definicion, next);
      for (const id of Object.keys(next)) {
        if (!newVisible.has(id)) {
          delete next[id];
        }
      }
      return next;
    });
    setErrors((prev) => {
      const rest = { ...prev };
      delete rest[fieldId];
      return rest;
    });
  }

  async function handleSubmit() {
    if (!onSubmit) return;
    setSubmitting(true);

    const allFields = getAllFields(definicion);
    const nextErrors: Record<string, string> = {};
    for (const field of allFields) {
      if (!visible.has(field.id) || field.type === 'heading') continue;
      const err = fieldError(field, answers[field.id]);
      if (err) nextErrors[field.id] = err;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitting(false);
      return;
    }

    try {
      const clean: Record<string, unknown> = {};
      for (const field of allFields) {
        if (!visible.has(field.id) || field.type === 'heading') continue;
        if (answers[field.id] !== undefined) clean[field.id] = answers[field.id];
      }
      await onSubmit(clean);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="space-y-6"
    >
      <header>
        <h1 className="font-display text-2xl text-[var(--ddna-navy)]">{titulo}</h1>
        {descripcion && <p className="text-sm text-slate-500 mt-1">{descripcion}</p>}
      </header>

      {hasBlocks(definicion) ? (
        <>
          {definicion.bloques!.map((bloque) => {
            const visibleFields = bloque.fields.filter((f) => visible.has(f.id));
            if (visibleFields.length === 0) return null;
            return (
              <section key={bloque.id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">{bloque.titulo}</h2>
                  {bloque.descripcion && (
                    <p className="text-sm text-slate-500 mt-1">{bloque.descripcion}</p>
                  )}
                </div>
                {visibleFields.map((field) =>
                  renderField(field, visible, answers, errors, preview, handleChange)
                )}
              </section>
            );
          })}
          {orphanFields && orphanFields.length > 0 && (
            <section className="bg-white rounded-xl border border-dashed border-slate-300 p-5 space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">Otros</h2>
              {orphanFields
                .filter((f) => visible.has(f.id))
                .map((field) =>
                  renderField(field, visible, answers, errors, preview, handleChange)
                )}
            </section>
          )}
        </>
      ) : (
        definicion.fields
          .filter((field) => visible.has(field.id))
          .map((field) =>
            renderField(field, visible, answers, errors, preview, handleChange)
          )
      )}

      {!preview && onSubmit && (
        <button
          type="submit"
          disabled={submitting}
          className={clsx(
            'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#1a2556] hover:bg-[#2a3570] transition-colors disabled:opacity-60'
          )}
        >
          {submitting ? 'Enviando…' : submitLabel}
        </button>
      )}
    </form>
  );
}
