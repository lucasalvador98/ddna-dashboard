'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Pencil,
  Link2,
  Eye,
  Trash2,
  ClipboardList,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import clsx from 'clsx';
import type { Formulario } from '@/lib/formularios/types';
import { deleteForm, toggleForm } from '@/lib/actions/formularios';
import { Toggle } from '@/components/monitoreo/toggle';

interface FormulariosClientProps {
  formularios: Formulario[];
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

function FormRow({
  form,
  busyId,
  onToggle,
  onDelete,
  onCopy,
}: {
  form: Formulario;
  busyId: string | null;
  onToggle: (id: string) => void;
  onDelete: (form: Formulario) => void;
  onCopy: (form: Formulario) => void;
}) {
  const isBusy = busyId === form.id;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[var(--ddna-navy)] flex-shrink-0" />
            <h3 className="font-semibold text-slate-800 truncate">{form.titulo}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">/f/{form.slug}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Toggle
            value={form.activo}
            onChange={() => onToggle(form.id)}
            label={form.activo ? 'Activo' : 'Inactivo'}
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
        <Link
          href={`/formularios/${form.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Editar
        </Link>
        <button
          type="button"
          onClick={() => onCopy(form)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <Link2 className="w-3.5 h-3.5" />
          Copiar link
        </button>
        <Link
          href={`/formularios/respuestas/${form.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          Respuestas
        </Link>
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onDelete(form)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Borrar
        </button>
      </div>
    </div>
  );
}

export function FormulariosClient({ formularios }: FormulariosClientProps) {
  const [items, setItems] = useState(formularios);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  async function handleToggle(id: string) {
    if (busyId) return;
    setBusyId(id);
    const prev = items.find((f) => f.id === id);
    if (!prev) return;

    setItems((list) =>
      list.map((f) => (f.id === id ? { ...f, activo: !f.activo } : f))
    );

    const result = await toggleForm(id);
    setBusyId(null);

    if (!result.ok) {
      setItems((list) => list.map((f) => (f.id === id ? prev : f)));
      setToast({ message: result.error, type: 'error' });
      return;
    }
    setToast({
      message: prev.activo ? 'Formulario desactivado.' : 'Formulario activado.',
      type: 'success',
    });
  }

  async function handleCopy(form: Formulario) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/f/${form.slug}`);
      setToast({ message: 'Link copiado al portapapeles.', type: 'success' });
    } catch {
      setToast({ message: 'No se pudo copiar el link.', type: 'error' });
    }
  }

  async function handleDelete(form: Formulario) {
    if (busyId) return;
    if (!window.confirm(`¿Eliminar el formulario "${form.titulo}"? Se borrarán también sus respuestas.`)) {
      return;
    }
    setBusyId(form.id);
    const result = await deleteForm(form.id);
    setBusyId(null);

    if (!result.ok) {
      setToast({ message: result.error, type: 'error' });
      return;
    }
    setItems((list) => list.filter((f) => f.id !== form.id));
    setToast({ message: 'Formulario eliminado.', type: 'success' });
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="bg-gradient-to-r from-[#334155] to-[#475569] rounded-xl px-6 py-6 mb-6">
        <h1 className="font-display text-2xl text-white">Formularios</h1>
        <p className="text-sm text-white/60 mt-1">
          Creá y administrá formularios para encuestas y relevamientos
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500">
          {items.length} {items.length === 1 ? 'formulario' : 'formularios'}
        </p>
        <Link
          href="/formularios/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#334155] hover:bg-[#475569] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo formulario
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Todavía no hay formularios.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((form) => (
            <FormRow
              key={form.id}
              form={form}
              busyId={busyId}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onCopy={handleCopy}
            />
          ))}
        </div>
      )}

      {toast && <Toast toast={toast} />}
    </div>
  );
}
