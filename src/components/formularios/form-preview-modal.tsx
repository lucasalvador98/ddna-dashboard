'use client';

// Backdrop modal that previews a form exactly as the public /f/[slug] view
// renders it, reusing BuilderPreview (no second renderer). Interaction contract
// matches QrModal: backdrop click / Escape close, Tab cycles inside the dialog,
// body scroll locked while open, focus restored on close. UI strings Spanish.

import { useCallback, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { Formulario } from '@/lib/formularios/types';
import { BuilderPreview } from '@/components/formularios/builder/builder-preview';

interface FormPreviewModalProps {
  form: Formulario | null;
  onClose: () => void;
}

export function FormPreviewModal({ form, onClose }: FormPreviewModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Move focus into the dialog on open and restore it on close.
  useEffect(() => {
    if (!form) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => {
      previouslyFocused?.focus();
    };
  }, [form]);

  // Escape closes the modal; Tab cycles within the dialog; lock body scroll.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!form) return;
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || active === dialogRef.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [form, onClose]
  );

  useEffect(() => {
    if (!form) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [form, handleKeyDown]);

  if (!form) return null;

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
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Vista previa del formulario"
        tabIndex={-1}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl outline-none flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-accent text-lg text-navy font-semibold">Vista previa</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 max-h-[85vh] overflow-y-auto">
          <BuilderPreview
            definicion={form.definicion}
            titulo={form.titulo}
            descripcion={form.descripcion ?? ''}
          />
        </div>
      </div>
    </div>
  );
}
