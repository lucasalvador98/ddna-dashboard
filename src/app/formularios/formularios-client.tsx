'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  QrCode,
  Download,
  Loader2,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import QRCode from 'qrcode';
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

function QrModal({
  form,
  onClose,
  onCopy,
}: {
  form: Formulario;
  onClose: () => void;
  onCopy: (form: Formulario) => void;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  const link = `${window.location.origin}/f/${form.slug}`;

  // Generate the QR lazily when the modal opens (client-side only).
  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(link, { width: 256, margin: 2, errorCorrectionLevel: 'M' })
      .then((dataUrl: string) => {
        if (!cancelled) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setQrError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [link]);

  // Escape closes the modal; lock body scroll while it is open.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Compartí este formulario"
        className="bg-white rounded-xl shadow-2xl w-full max-w-md"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-accent text-lg text-[#334155] font-semibold">
            Compartí este formulario
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-5">
          {qrError ? (
            <div className="w-48 h-48 flex items-center justify-center bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center px-4">
                No se pudo generar el código QR.
              </p>
            </div>
          ) : qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`Código QR para ${form.titulo}`}
              className="w-48 h-48 border border-slate-200 rounded-lg"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-lg">
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            </div>
          )}

          <p
            className="text-xs font-mono text-slate-600 truncate max-w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
            title={link}
          >
            {link}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onCopy(form)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <Link2 className="w-3.5 h-3.5" />
              Copiar link
            </button>
            <a
              href={qrDataUrl ?? undefined}
              download={`formulario-${form.slug}-qr.png`}
              className={clsx(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors',
                !qrDataUrl && 'pointer-events-none opacity-50'
              )}
              aria-disabled={!qrDataUrl}
            >
              <Download className="w-3.5 h-3.5" />
              Descargar QR
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormRow({
  form,
  busyId,
  onToggle,
  onDelete,
  onCopy,
  onShowQr,
}: {
  form: Formulario;
  busyId: string | null;
  onToggle: (id: string) => void;
  onDelete: (form: Formulario) => void;
  onCopy: (form: Formulario) => void;
  onShowQr: (form: Formulario) => void;
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
        <button
          type="button"
          onClick={() => onShowQr(form)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <QrCode className="w-3.5 h-3.5" />
          QR
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
  const [qrFormId, setQrFormId] = useState<string | null>(null);

  const qrForm = items.find((f) => f.id === qrFormId) ?? null;

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
              onShowQr={(f) => setQrFormId(f.id)}
            />
          ))}
        </div>
      )}

      {qrForm && (
        <QrModal
          form={qrForm}
          onClose={() => setQrFormId(null)}
          onCopy={handleCopy}
        />
      )}

      {toast && <Toast toast={toast} />}
    </div>
  );
}
