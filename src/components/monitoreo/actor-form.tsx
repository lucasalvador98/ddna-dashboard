'use client';

import { Trash2 } from 'lucide-react';
import {
  GENERO_ACTOR_OPTIONS,
  FRANJA_ETARIA_OPTIONS,
  VICTIMARIO_VICTIMA_OPTIONS,
  ROL_OPTIONS,
  type ActorFormData,
} from './constants';
import { SelectField } from './select-field';
import { TextInput } from './text-input';
import { Toggle } from './toggle';

interface ActorFormProps {
  actor: ActorFormData;
  index: number;
  total: number;
  onChange: (index: number, field: keyof ActorFormData, value: string | boolean) => void;
  onRemove: (index: number) => void;
}

export function ActorForm({ actor, index, total, onChange, onRemove }: ActorFormProps) {
  return (
    <div className="border border-slate-200 rounded-lg p-4 relative">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-600">Actor #{index + 1}</span>
        {total > 1 && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Quitar
          </button>
        )}
      </div>

      <div className="space-y-3">
        <TextInput
          label="Descripción del actor"
          value={actor.actor_descripcion}
          onChange={v => onChange(index, 'actor_descripcion', v)}
          placeholder="Descripción o nombre"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SelectField
            label="Género"
            value={actor.genero}
            options={GENERO_ACTOR_OPTIONS}
            onChange={v => onChange(index, 'genero', v)}
          />
          <SelectField
            label="Franja etaria"
            value={actor.franja_etaria}
            options={FRANJA_ETARIA_OPTIONS}
            onChange={v => onChange(index, 'franja_etaria', v)}
          />
          <SelectField
            label="Victimario / Víctima"
            value={actor.victimario_victima}
            options={VICTIMARIO_VICTIMA_OPTIONS}
            onChange={v => onChange(index, 'victimario_victima', v)}
          />
          <SelectField
            label="Rol"
            value={actor.rol}
            options={ROL_OPTIONS}
            onChange={v => onChange(index, 'rol', v)}
          />
        </div>
        <Toggle
          label="¿Identificable?"
          value={actor.identificabilidad}
          onChange={v => onChange(index, 'identificabilidad', v)}
        />
      </div>
    </div>
  );
}
