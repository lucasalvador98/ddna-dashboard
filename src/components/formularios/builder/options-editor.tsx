'use client';

// Editable options list for select/radio/checkbox fields: text rows with
// reorder arrows and remove, plus an "add option" action. The list never
// drops below one option so `validateDefinition` stays satisfiable.

import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

interface OptionsEditorProps {
  options: string[];
  onChange: (options: string[]) => void;
}

export function OptionsEditor({ options, onChange }: OptionsEditorProps) {
  function setOption(index: number, value: string) {
    onChange(options.map((opt, i) => (i === index ? value : opt)));
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...options];
    [next[index], next[index + dir]] = [next[index + dir], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {options.map((opt, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <input
            value={opt}
            onChange={(e) => setOption(index, e.target.value)}
            placeholder={`Opción ${index + 1}`}
            className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--ddna-blue)] focus:border-transparent"
          />
          <button
            type="button"
            disabled={index === 0}
            onClick={() => move(index, -1)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30"
            aria-label="Mover opción arriba"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={index === options.length - 1}
            onClick={() => move(index, 1)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30"
            aria-label="Mover opción abajo"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={options.length === 1}
            onClick={() => onChange(options.filter((_, i) => i !== index))}
            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
            aria-label="Eliminar opción"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...options, ''])}
        className="inline-flex items-center gap-1 text-xs font-medium text-[var(--ddna-blue)] hover:underline"
      >
        <Plus className="w-3.5 h-3.5" />
        Agregar opción
      </button>
    </div>
  );
}
