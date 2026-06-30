'use client';

import clsx from 'clsx';

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}

export function Toggle({ value, onChange, label }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={value}
          onChange={e => onChange(e.target.checked)}
        />
        <div
          className={clsx(
            'block w-10 h-6 rounded-full transition-colors',
            value ? 'bg-[var(--ddna-blue)]' : 'bg-slate-300'
          )}
        />
        <div
          className={clsx(
            'absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm',
            value && 'translate-x-4'
          )}
        />
      </div>
      <span className="text-sm text-slate-700 group-hover:text-slate-900">{label}</span>
    </label>
  );
}
