'use client';

// Live preview for the builder: renders the shared FormRenderer in preview
// mode with the definition being edited. The `key` remounts the renderer when
// fields are added/removed/reordered, resetting the draft answers.

import { FormRenderer } from '@/components/formularios/form-renderer';
import type { DefinicionFormulario } from '@/lib/formularios/types';

interface BuilderPreviewProps {
  definicion: DefinicionFormulario;
  titulo: string;
  descripcion: string;
}

export function BuilderPreview({ definicion, titulo, descripcion }: BuilderPreviewProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">
        Vista previa
      </p>
      <FormRenderer
        key={definicion.fields.map((f) => f.id).join('|')}
        definicion={definicion}
        titulo={titulo}
        descripcion={descripcion}
        preview
      />
    </div>
  );
}
