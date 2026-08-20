'use client';

// Response detail drawer (repo-file-drawer pattern): submitted_at, id and the
// pretty-printed JSON answers, with a delete action in the footer.

import { X, Trash2, Loader2 } from 'lucide-react';
import type { FormularioRespuesta } from '@/lib/formularios/types';

interface ResponseDetailProps {
  respuesta: FormularioRespuesta | null;
  busyId: string | null;
  onClose: () => void;
  onDelete: (respuesta: FormularioRespuesta) => void;
}

function formatSubmittedAt(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ResponseDetail({ respuesta, busyId, onClose, onDelete }: ResponseDetailProps) {
  if (!respuesta) return null;

  const handleDelete = () => {
    if (window.confirm('¿Eliminar esta respuesta? Esta acción no se puede deshacer.')) {
      onDelete(respuesta);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Detalle de la respuesta"
        className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
        style={{ animation: 'drawer-in 200ms ease-out' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-accent text-base text-navy">Detalle de la respuesta</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            type="button"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                Enviada
              </p>
              <p className="text-sm text-gray-700 mt-0.5">
                {formatSubmittedAt(respuesta.submitted_at)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">ID</p>
              <p className="text-xs text-gray-700 font-mono mt-0.5">{respuesta.id}</p>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1.5 block">
              Respuestas
            </label>
            <pre className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-words text-slate-700 font-mono">
              {JSON.stringify(respuesta.respuestas, null, 2)}
            </pre>
          </div>
        </div>

        <div className="border-t border-gray-200 px-5 py-3 flex items-center justify-end bg-gray-50">
          <button
            onClick={handleDelete}
            disabled={busyId === respuesta.id}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium disabled:opacity-50"
            type="button"
          >
            {busyId === respuesta.id ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            Borrar
          </button>
        </div>
      </div>
    </>
  );
}
