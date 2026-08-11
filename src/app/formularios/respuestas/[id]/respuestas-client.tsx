'use client';

// Admin responses orchestrator: header band, export CSV button, table of
// responses, JSON detail drawer and delete-with-confirm. UI strings Spanish;
// identifiers/comments in English.

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Loader2, Inbox, CheckCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';
import type { Formulario, FormularioRespuesta } from '@/lib/formularios/types';
import { deleteRespuesta, exportRespuestasCsv } from '@/lib/actions/formularios';
import { ResponsesTable } from '@/components/formularios/admin/responses-table';
import { ResponseDetail } from '@/components/formularios/admin/response-detail';

interface RespuestasClientProps {
  form: Formulario | null;
  respuestas: FormularioRespuesta[];
}

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

function Toast({ toast }: { toast: ToastState }) {
  return (
    <div
      className={clsx(
        'fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium',
        toast.type === 'success'
          ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          : 'bg-red-50 border border-red-200 text-red-800'
      )}
    >
      {toast.type === 'success' ? (
        <CheckCircle className="w-4 h-4 flex-shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 flex-shrink-0" />
      )}
      {toast.message}
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/formularios"
      className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      Volver a formularios
    </Link>
  );
}

export function RespuestasClient({ form, respuestas }: RespuestasClientProps) {
  const [items, setItems] = useState(respuestas);
  const [selected, setSelected] = useState<FormularioRespuesta | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  async function handleDelete(respuesta: FormularioRespuesta) {
    if (busyId) return;
    if (!window.confirm('¿Eliminar esta respuesta? Esta acción no se puede deshacer.')) {
      return;
    }
    setBusyId(respuesta.id);
    const result = await deleteRespuesta(respuesta.id);
    setBusyId(null);

    if (!result.ok) {
      setToast({ message: result.error, type: 'error' });
      return;
    }
    setItems((list) => list.filter((r) => r.id !== respuesta.id));
    setSelected(null);
    setToast({ message: 'Respuesta eliminada.', type: 'success' });
  }

  async function handleExport() {
    if (!form || exporting) return;
    setExporting(true);
    const result = await exportRespuestasCsv(form.id);
    setExporting(false);

    if (!result.ok) {
      setToast({ message: result.error, type: 'error' });
      return;
    }

    const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `respuestas-${form.slug}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setToast({ message: 'Archivo CSV descargado.', type: 'success' });
  }

  if (!form) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <BackLink />
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Formulario no encontrado.</p>
        </div>
      </div>
    );
  }

  const empty = items.length === 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <BackLink />

      <div className="bg-gradient-to-r from-[#1a2556] to-[#2a3570] rounded-xl px-6 py-6 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl text-white truncate">{form.titulo}</h1>
          <p className="text-sm text-white/60 mt-1">
            Respuestas — {items.length} {items.length === 1 ? 'respuesta' : 'respuestas'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={empty || exporting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Exportar CSV
        </button>
      </div>

      {empty ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Todavía no hay respuestas para este formulario.</p>
          <p className="text-sm text-slate-400 mt-1">
            Compartí el link público para empezar a recibir respuestas.
          </p>
        </div>
      ) : (
        <ResponsesTable
          respuestas={items}
          definicion={form.definicion}
          busyId={busyId}
          onView={setSelected}
          onDelete={handleDelete}
        />
      )}

      <ResponseDetail
        respuesta={selected}
        busyId={busyId}
        onClose={() => setSelected(null)}
        onDelete={handleDelete}
      />

      {toast && <Toast toast={toast} />}
    </div>
  );
}
