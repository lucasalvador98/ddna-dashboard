'use client';

// Per-field-type input primitives for the shared FormRenderer.
// Browser-safe (no supabase import). UI strings are Spanish; comments/ids English.

import clsx from 'clsx';
import type { CampoFormulario } from '@/lib/formularios/types';

export interface FieldInputProps {
  field: CampoFormulario;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s().-]{6,}$/;

/** Client-side per-field validation (UX only; server re-validates). Returns a Spanish error or null. */
export function fieldError(field: CampoFormulario, value: unknown): string | null {
  if (field.type === 'heading') return null;

  const empty =
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0);

  if (empty) {
    return field.required ? 'Campo obligatorio' : null;
  }

  switch (field.type) {
    case 'email':
      return typeof value === 'string' && EMAIL_REGEX.test(value)
        ? null
        : 'Ingresá un email válido';
    case 'phone':
      return typeof value === 'string' && PHONE_REGEX.test(value)
        ? null
        : 'Ingresá un teléfono válido';
    case 'number':
      return typeof value === 'number' && !Number.isNaN(value) ? null : 'Ingresá un número válido';
    case 'date':
      return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? null
        : 'Ingresá una fecha válida';
    case 'select':
    case 'radio':
      return typeof value === 'string' && field.options.includes(value)
        ? null
        : 'Seleccioná una opción válida';
    case 'checkbox':
      return Array.isArray(value) && value.every((v) => typeof v === 'string' && field.options.includes(v))
        ? null
        : 'Seleccioná opciones válidas';
    case 'scale':
      return typeof value === 'number' && value >= field.min && value <= field.max
        ? null
        : `El valor debe estar entre ${field.min} y ${field.max}`;
    default:
      return null;
  }
}

const inputClass = (error?: string) =>
  clsx(
    'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[var(--ddna-blue)] focus:border-transparent',
    error ? 'border-red-400' : 'border-slate-300'
  );

export function FieldInput({ field, value, onChange, error }: FieldInputProps) {
  if (field.type === 'heading') {
    return <h3 className="text-lg font-semibold text-[var(--ddna-navy)] mt-2">{field.label}</h3>;
  }

  switch (field.type) {
    case 'text':
    case 'email':
    case 'phone':
    case 'date':
      return (
        <input
          id={field.id}
          type={field.type === 'date' ? 'date' : field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
          value={(value as string) ?? ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass(error)}
        />
      );
    case 'textarea':
      return (
        <textarea
          id={field.id}
          value={(value as string) ?? ''}
          placeholder={field.placeholder}
          rows={4}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass(error)}
        />
      );
    case 'number':
      return (
        <input
          id={field.id}
          type="number"
          value={value === undefined || value === null ? '' : String(value)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          className={inputClass(error)}
        />
      );
    case 'select':
      return (
        <select
          id={field.id}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          className={inputClass(error)}
        >
          <option value="">{field.placeholder ?? 'Seleccioná una opción'}</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    case 'radio':
      return (
        <div className="space-y-2">
          {field.options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="accent-[var(--ddna-blue)]"
              />
              {opt}
            </label>
          ))}
        </div>
      );
    case 'checkbox':
      return (
        <div className="space-y-2">
          {field.options.map((opt) => {
            const checked = Array.isArray(value) && value.includes(opt);
            return (
              <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  value={opt}
                  checked={checked}
                  onChange={(e) => {
                    const current = Array.isArray(value) ? [...value] : [];
                    const next = e.target.checked
                      ? [...current, opt]
                      : current.filter((v) => v !== opt);
                    onChange(next);
                  }}
                  className="accent-[var(--ddna-blue)]"
                />
                {opt}
              </label>
            );
          })}
        </div>
      );
    case 'scale':
      return (
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            {Array.from({ length: field.max - field.min + 1 }, (_, i) => field.min + i).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange(value === n ? undefined : n)}
                className={clsx(
                  'w-10 h-10 rounded-lg border text-sm font-medium transition-colors',
                  value === n
                    ? 'bg-[var(--ddna-blue)] text-white border-[var(--ddna-blue)]'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-[var(--ddna-blue)]'
                )}
              >
                {n}
              </button>
            ))}
          </div>
          {(field.minLabel || field.maxLabel) && (
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>{field.minLabel}</span>
              <span>{field.maxLabel}</span>
            </div>
          )}
        </div>
      );
  }
}
