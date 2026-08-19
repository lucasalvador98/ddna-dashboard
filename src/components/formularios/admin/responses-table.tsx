'use client';

// Responses table: Nº / submitted_at / first 4 answerable field preview
// columns / actions (view detail, delete). UI strings Spanish.

import { Eye, Trash2, Loader2 } from 'lucide-react';
import type { DefinicionFormulario, FormularioRespuesta } from '@/lib/formularios/types';

interface ResponsesTableProps {
  respuestas: FormularioRespuesta[];
  definicion: DefinicionFormulario;
  busyId: string | null;
  onView: (respuesta: FormularioRespuesta) => void;
  onDelete: (respuesta: FormularioRespuesta) => void;
}

const PREVIEW_FIELDS = 4;

function formatSubmittedAt(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatValue(value: unknown): string {
  if (value === undefined || value === null) return '—';
  if (Array.isArray(value)) return value.join(', ') || '—';
  return String(value);
}

export function ResponsesTable({
  respuestas,
  definicion,
  busyId,
  onView,
  onDelete,
}: ResponsesTableProps) {
  const previewFields = definicion.fields
    .filter((field) => field.type !== 'heading')
    .slice(0, PREVIEW_FIELDS);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Nº
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Enviada
              </th>
              {previewFields.map((field) => (
                <th
                  key={field.id}
                  className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  {field.label}
                </th>
              ))}
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {respuestas.map((respuesta, index) => (
              <tr key={respuesta.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-400 font-mono whitespace-nowrap">
                  {index + 1}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                  {formatSubmittedAt(respuesta.submitted_at)}
                </td>
                {previewFields.map((field) => (
                  <td key={field.id} className="px-4 py-3 text-sm text-slate-600 max-w-[180px] truncate">
                    {formatValue(respuesta.respuestas[field.id])}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onView(respuesta)}
                      title="Ver detalle"
                      aria-label="Ver detalle"
                      className="p-1.5 text-slate-400 hover:text-[var(--ddna-blue)] hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(respuesta)}
                      disabled={busyId === respuesta.id}
                      title="Borrar respuesta"
                      aria-label="Borrar respuesta"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {busyId === respuesta.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
