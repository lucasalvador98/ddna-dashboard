'use client';

// Field card for the builder: index + type badge, inline label input, reorder
// arrows, required toggle (never for heading), expand/collapse, delete, and a
// collapsible body with per-type properties plus the visibility rule editor.

import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import type { CampoFormulario, ReglaLogica } from '@/lib/formularios/types';
import { FIELD_TYPE_META } from '@/lib/formularios/defaults';
import { TextInput } from '@/components/monitoreo/text-input';
import { Toggle } from '@/components/monitoreo/toggle';
import { OptionsEditor } from './options-editor';
import { ScaleEditor } from './scale-editor';
import { LogicEditor } from './logic-editor';

interface FieldEditorProps {
  field: CampoFormulario;
  index: number;
  total: number;
  logic: ReglaLogica[];
  allFields: CampoFormulario[];
  onUpdate: (patch: Partial<CampoFormulario>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onLogicChange: (logic: ReglaLogica[]) => void;
}

const HAS_PLACEHOLDER = new Set(['text', 'textarea', 'email', 'phone', 'number', 'date', 'select']);

export function FieldEditor({
  field,
  index,
  total,
  logic,
  allFields,
  onUpdate,
  onMove,
  onRemove,
  onLogicChange,
}: FieldEditorProps) {
  const [expanded, setExpanded] = useState(true);
  const isOptions = field.type === 'select' || field.type === 'radio' || field.type === 'checkbox';

  function moveButton(dir: -1 | 1, disabled: boolean) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => onMove(dir)}
        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label={dir === -1 ? 'Mover campo arriba' : 'Mover campo abajo'}
      >
        {dir === -1 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 p-4">
        <span className="text-xs font-mono text-slate-400 w-6 flex-shrink-0">{index + 1}</span>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--ddna-blue)]/10 text-[var(--ddna-blue)] flex-shrink-0">
          {FIELD_TYPE_META[field.type].label}
        </span>
        <input
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="Escribí la pregunta…"
          className="flex-1 min-w-0 text-sm font-medium text-slate-800 bg-transparent border border-transparent rounded-lg px-2 py-1.5 focus:border-slate-300 focus:bg-white"
        />
        {moveButton(-1, index === 0)}
        {moveButton(1, index === total - 1)}
        {field.type !== 'heading' && (
          <Toggle
            value={field.required}
            onChange={(v) => onUpdate({ required: v })}
            label={field.required ? 'Obligatorio' : 'Opcional'}
          />
        )}
        <button
          type="button"
          onClick={() => setExpanded((x) => !x)}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label={expanded ? 'Contraer campo' : 'Expandir campo'}
        >
          <ChevronDown className={clsx('w-4 h-4 transition-transform', expanded && 'rotate-180')} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600"
          aria-label="Eliminar campo"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-4 border-t border-slate-100 space-y-4">
          {HAS_PLACEHOLDER.has(field.type) && (
            <TextInput
              label="Placeholder"
              value={field.placeholder ?? ''}
              onChange={(v) => onUpdate({ placeholder: v })}
            />
          )}
          <TextInput
            label="Texto de ayuda"
            value={field.helpText ?? ''}
            onChange={(v) => onUpdate({ helpText: v })}
          />
          {isOptions && (
            <OptionsEditor options={field.options} onChange={(options) => onUpdate({ options })} />
          )}
          {field.type === 'scale' && (
            <ScaleEditor
              min={field.min}
              max={field.max}
              minLabel={field.minLabel}
              maxLabel={field.maxLabel}
              onChange={(patch) => onUpdate(patch)}
            />
          )}
          <LogicEditor targetId={field.id} logic={logic} fields={allFields} onChange={onLogicChange} />
        </div>
      )}
    </div>
  );
}
