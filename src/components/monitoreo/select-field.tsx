'use client';

import clsx from 'clsx';

interface SelectFieldProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  onBlur?: () => void;
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder,
  required,
  error,
  onBlur,
}: SelectFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        required={required}
        className={clsx(
          'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[var(--ddna-blue)] focus:border-transparent bg-white',
          error ? 'border-red-400' : 'border-slate-300'
        )}
      >
        <option value="">{placeholder || `Seleccionar ${label.toLowerCase()}`}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
