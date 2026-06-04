'use client';

/**
 * report-modal — Modal with category selector + report generation.
 *
 * Features:
 * - Category checkboxes (6 categories + "Todas" toggle)
 * - Loading spinner during generation
 * - Error state with "Reintentar" button
 * - Print button
 * - Escape key / backdrop click / X button to close
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Loader2, FileText, Printer, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { ReportContent } from './report-content';
import type { ExecutiveReport } from '@/lib/informe-ejecutivo';

// ─── Constants ──────────────────────────────────────────────────

const ALL_CATEGORIES = [
  { id: 'pobreza', label: 'Pobreza' },
  { id: 'salud', label: 'Salud' },
  { id: 'educacion', label: 'Educación' },
  { id: 'inversion', label: 'Inversión Social' },
  { id: 'seguridad', label: 'Seguridad' },
  { id: 'demografia', label: 'Demografía' },
] as const;

// ─── Props ──────────────────────────────────────────────────────

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── State ──────────────────────────────────────────────────────

type ModalState =
  | { phase: 'form' }
  | { phase: 'loading' }
  | { phase: 'error'; error: string }
  | { phase: 'done'; report: ExecutiveReport; generatedAt: string };

// ─── Component ─────────────────────────────────────────────────

export function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set(ALL_CATEGORIES.map((c) => c.id)),
  );
  const [state, setState] = useState<ModalState>({ phase: 'form' });
  const backdropRef = useRef<HTMLDivElement>(null);

  // ── Reset form when modal opens ──────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setSelectedCategories(new Set(ALL_CATEGORIES.map((c) => c.id)));
      setState({ phase: 'form' });
    }
  }, [isOpen]);

  // ── Escape key handler ───────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // ── Backdrop click ───────────────────────────────────────────
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === backdropRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  // ── Toggle category ──────────────────────────────────────────
  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  };

  // ── Toggle all ───────────────────────────────────────────────
  const allSelected = selectedCategories.size === ALL_CATEGORIES.length;
  const toggleAll = () => {
    if (allSelected) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(ALL_CATEGORIES.map((c) => c.id)));
    }
  };

  // ── Generate report ──────────────────────────────────────────
  const generateReport = async () => {
    // If none selected, select all
    const categories =
      selectedCategories.size > 0
        ? Array.from(selectedCategories)
        : ALL_CATEGORIES.map((c) => c.id);

    setSelectedCategories(new Set(categories));
    setState({ phase: 'loading' });

    try {
      const response = await fetch(
        '/api/repositorio/informe-ejecutivo',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categories }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Error HTTP ${response.status}`,
        );
      }

      const data = await response.json();
      setState({
        phase: 'done',
        report: data.report as ExecutiveReport,
        generatedAt: data.generatedAt as string,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error desconocido';
      setState({ phase: 'error', error: message });
    }
  };

  // ── Print handler ────────────────────────────────────────────
  const handlePrint = () => {
    window.print();
  };

  // ── Render: nothing if closed ────────────────────────────────
  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:bg-white print:backdrop-blur-none print:p-0 print:static print:inset-auto print:z-auto"
    >
      <div
        className={clsx(
          'bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col',
          'print:shadow-none print:rounded-none print:max-h-none print:h-auto',
          'report-modal-print-area',
        )}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00074E]/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#00074E]" />
            </div>
            <div>
              <h2 className="font-accent text-lg text-[#00074E] font-semibold">
                Informe Ejecutivo
              </h2>
              <p className="text-xs text-gray-500 font-body">
                Análisis de indicadores de NNyA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 print:overflow-visible print:p-0">
          {/* ── Form Phase ──────────────────────────────────── */}
          {state.phase === 'form' && (
            <div className="space-y-6">
              <p className="font-body text-gray-600">
                Seleccioná las categorías de indicadores que querés incluir
                en el informe ejecutivo. El análisis será generado por IA
                basado en los datos disponibles.
              </p>

              {/* Selector de categorías */}
              <div className="space-y-3">
                {/* "Todas" toggle */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#00074E] focus:ring-[#00074E]"
                  />
                  <span className="font-accent text-sm font-semibold text-[#00074E]">
                    Todas las categorías
                  </span>
                </label>

                <div className="border-t border-gray-100 pt-3" />

                {/* Individual categories */}
                <div className="grid grid-cols-2 gap-2">
                  {ALL_CATEGORIES.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.has(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#FF7F11] focus:ring-[#FF7F11]"
                      />
                      <span className="font-body text-sm text-gray-700 group-hover:text-gray-900">
                        {cat.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Generate button */}
              <button
                onClick={generateReport}
                className="w-full py-3 bg-[#00074E] hover:bg-[#00074E]/90 text-white font-accent font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Generar Informe
              </button>
            </div>
          )}

          {/* ── Loading Phase ────────────────────────────────── */}
          {state.phase === 'loading' && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <Loader2 className="w-12 h-12 text-[#FF7F11] animate-spin" />
              <p className="font-body text-gray-600 text-lg">
                Generando...
              </p>
              <p className="font-body text-gray-400 text-sm">
                Analizando indicadores y generando el informe. Esto puede
                tomar unos segundos.
              </p>
            </div>
          )}

          {/* ── Error Phase ──────────────────────────────────── */}
          {state.phase === 'error' && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <p className="font-body text-gray-700 text-lg font-medium">
                Error al generar el informe
              </p>
              <p className="font-body text-gray-500 text-sm text-center max-w-md">
                {state.error}
              </p>
              <button
                onClick={generateReport}
                className="px-6 py-2.5 bg-[#FF7F11] hover:bg-[#FF7F11]/90 text-white font-accent font-semibold rounded-lg transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* ── Done Phase ───────────────────────────────────── */}
          {state.phase === 'done' && (
            <div>
              <ReportContent
                report={state.report}
                generatedAt={state.generatedAt}
              />
            </div>
          )}
        </div>

        {/* ── Footer (done phase) ────────────────────────────── */}
        {state.phase === 'done' && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 print:hidden">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-body transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#00074E] hover:bg-[#00074E]/90 text-white font-accent font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
