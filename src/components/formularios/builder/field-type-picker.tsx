'use client';

// Dropdown to add a field of any of the 11 supported types.
// UI strings in Spanish; identifiers/comments in English.

import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import clsx from 'clsx';
import { FIELD_TYPE_META } from '@/lib/formularios/defaults';
import type { TipoCampo } from '@/lib/formularios/types';

interface FieldTypePickerProps {
  disabled?: boolean;
  onSelect: (type: TipoCampo) => void;
}

export function FieldTypePicker({ disabled, onSelect }: FieldTypePickerProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const types = Object.keys(FIELD_TYPE_META) as TipoCampo[];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#1a2556] hover:bg-[#2a3570] transition-colors disabled:opacity-50'
        )}
      >
        <Plus className="w-4 h-4" />
        Agregar campo
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-lg py-1">
          {types.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                onSelect(type);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              {FIELD_TYPE_META[type].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
