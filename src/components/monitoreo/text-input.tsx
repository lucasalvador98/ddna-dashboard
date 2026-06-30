'use client';

import clsx from 'clsx';

interface TextInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
  onBlur?: () => void;
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
  error,
  onBlur,
}: TextInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        className={clsx(
          'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[var(--ddna-blue)] focus:border-transparent',
          error ? 'border-red-400' : 'border-slate-300'
        )}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
