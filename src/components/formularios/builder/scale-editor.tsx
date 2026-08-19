'use client';

// Scale field properties: min/max numbers and optional endpoint labels.
// `validateDefinition` enforces min < max on save.

import { TextInput } from '@/components/monitoreo/text-input';

export interface ScalePatch {
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
}

interface ScaleEditorProps {
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
  onChange: (patch: ScalePatch) => void;
}

export function ScaleEditor({ min, max, minLabel, maxLabel, onChange }: ScaleEditorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <TextInput label="Mínimo" type="number" value={String(min)} onChange={(v) => onChange({ min: Number(v) || 0 })} />
      <TextInput label="Máximo" type="number" value={String(max)} onChange={(v) => onChange({ max: Number(v) || 0 })} />
      <TextInput label="Etiqueta del mínimo" value={minLabel ?? ''} onChange={(v) => onChange({ minLabel: v })} />
      <TextInput label="Etiqueta del máximo" value={maxLabel ?? ''} onChange={(v) => onChange({ maxLabel: v })} />
    </div>
  );
}
