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
import { X, Loader2, FileText, Printer, AlertCircle, Check } from 'lucide-react';
import clsx from 'clsx';
import { ReportContent } from './report-content';
import type { ExecutiveReport } from '@/lib/informe-ejecutivo';

// ─── Constants ──────────────────────────────────────────────────

// Thematic axes shown to the user — each maps to one or more DB categories server-side
const THEMATIC_AXES = [
  { id: 'educacion', label: 'Educación', description: 'Matrícula, Aprender, Anuario' },
  { id: 'salud', label: 'Salud', description: 'TMI, RMM, DEIS, salud adolescente' },
  { id: 'pobreza', label: 'Pobreza', description: 'Pobreza, indigencia, alimentación, empleo' },
  { id: 'inversion', label: 'Inversión Social', description: 'Inversión en infancia por rubro' },
  {
    id: 'seguridad_justicia',
    label: 'Seguridad y Justicia',
    description: 'Violencia familiar, justicia penal juvenil',
  },
  { id: 'demografia', label: 'Demografía', description: 'Población por edad y departamento' },
] as const;

const ALL_AXIS_IDS = THEMATIC_AXES.map(a => a.id);

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
  const [selectedAxes, setSelectedAxes] = useState<Set<string>>(() => new Set(ALL_AXIS_IDS));
  const [state, setState] = useState<ModalState>({ phase: 'form' });
  const backdropRef = useRef<HTMLDivElement>(null);

  // ── Reset form when modal opens ──────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setSelectedAxes(new Set(ALL_AXIS_IDS));
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
    [isOpen, onClose]
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
    [onClose]
  );

  // ── Toggle axis ──────────────────────────────────────────────
  const toggleAxis = (axisId: string) => {
    setSelectedAxes(prev => {
      const next = new Set(prev);
      if (next.has(axisId)) {
        next.delete(axisId);
      } else {
        next.add(axisId);
      }
      return next;
    });
  };

  // ── Toggle all ───────────────────────────────────────────────
  const allSelected = selectedAxes.size === ALL_AXIS_IDS.length;
  const toggleAll = () => {
    if (allSelected) {
      setSelectedAxes(new Set());
    } else {
      setSelectedAxes(new Set(ALL_AXIS_IDS));
    }
  };

  // ── Generate report ──────────────────────────────────────────
  const generateReport = async () => {
    const axes = selectedAxes.size > 0 ? Array.from(selectedAxes) : ALL_AXIS_IDS;

    setSelectedAxes(new Set(axes));
    setState({ phase: 'loading' });

    try {
      const response = await fetch('/api/repositorio/informe-ejecutivo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ axes }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error HTTP ${response.status}`);
      }

      const data = await response.json();
      setState({
        phase: 'done',
        report: data.report as ExecutiveReport,
        generatedAt: data.generatedAt as string,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
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
          'report-modal-print-area'
        )}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1a2556]/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#1a2556]" />
            </div>
            <div>
              <h2 className="font-accent text-lg text-[#1a2556] font-semibold">
                Informe Ejecutivo
              </h2>
              <p className="text-xs text-gray-500 font-body">Análisis de indicadores de NNyA</p>
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
                Seleccioná las categorías de indicadores que querés incluir en el informe ejecutivo.
                El análisis será generado por IA basado en los datos disponibles.
              </p>

              {/* Selector de ejes temáticos */}
              <div className="space-y-3">
                {/* "Todos" toggle */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#1a2556] focus:ring-[#1a2556]"
                  />
                  <span className="font-accent text-sm font-semibold text-[#1a2556]">
                    Todos los ejes temáticos
                  </span>
                </label>

                <div className="border-t border-gray-100 pt-3" />

                <div className="grid grid-cols-1 gap-2">
                  {THEMATIC_AXES.map(axis => (
                    <label
                      key={axis.id}
                      className={clsx(
                        'flex items-start gap-3 cursor-pointer p-3 rounded-lg border transition-colors',
                        selectedAxes.has(axis.id)
                          ? 'border-[#FF7F11]/40 bg-[#FF7F11]/5'
                          : 'border-gray-100 hover:bg-gray-50'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAxes.has(axis.id)}
                        onChange={() => toggleAxis(axis.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#FF7F11] focus:ring-[#FF7F11] mt-0.5"
                      />
                      <div>
                        <span className="font-accent text-sm font-semibold text-gray-800">
                          {axis.label}
                        </span>
                        <p className="font-body text-xs text-gray-500 mt-0.5">{axis.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Generate button */}
              <button
                onClick={generateReport}
                className="w-full py-3 bg-[#1a2556] hover:bg-[#1a2556]/90 text-white font-accent font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Generar Informe
              </button>
            </div>
          )}

          {/* ── Loading Phase (multi-step) ──────────────────── */}
          {state.phase === 'loading' && <LoadingSteps />}

          {/* ── Error Phase ──────────────────────────────────── */}
          {state.phase === 'error' && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <p className="font-body text-gray-700 text-lg font-medium">
                Error al generar el informe
              </p>
              <p className="font-body text-gray-500 text-sm text-center max-w-md">{state.error}</p>
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
              <ReportContent report={state.report} generatedAt={state.generatedAt} />
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
              className="px-4 py-2 bg-[#1a2556] hover:bg-[#1a2556]/90 text-white font-accent font-semibold rounded-lg transition-colors flex items-center gap-2"
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

// ─── Multi-step Loading Animation ───────────────────────────────

const LOADING_STEPS = [
  {
    label: 'Consultando base de datos...',
    description: 'Recuperando indicadores de las categorías seleccionadas',
  },
  {
    label: 'Buscando documentos relacionados...',
    description: 'Revisando documentos del repositorio',
  },
  {
    label: 'Consultando fuentes web...',
    description: 'Buscando contexto comparativo en línea',
  },
  {
    label: 'Generando informe crítico...',
    description: 'Analizando y cruzando todas las fuentes con IA',
  },
] as const;

function LoadingSteps() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep >= LOADING_STEPS.length - 1) return;
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 3500);
    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <Loader2 className="w-12 h-12 text-[#FF7F11] animate-spin" />
      <div className="space-y-4 w-full max-w-sm">
        {LOADING_STEPS.map((step, idx) => {
          const isActive = idx === currentStep;
          const isDone = idx < currentStep;
          return (
            <div
              key={step.label}
              className={clsx(
                'flex items-start gap-3 transition-opacity duration-300',
                isActive ? 'opacity-100' : isDone ? 'opacity-60' : 'opacity-30'
              )}
            >
              <div
                className={clsx(
                  'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                  isDone ? 'bg-green-100' : isActive ? 'bg-[#FF7F11]/10' : 'bg-gray-100'
                )}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <div
                    className={clsx(
                      'w-2 h-2 rounded-full',
                      isActive ? 'bg-[#FF7F11] animate-pulse' : 'bg-gray-300'
                    )}
                  />
                )}
              </div>
              <div className="min-w-0">
                <p
                  className={clsx(
                    'font-body text-sm font-medium',
                    isDone ? 'text-green-700' : isActive ? 'text-gray-800' : 'text-gray-400'
                  )}
                >
                  {step.label}
                </p>
                <p className="font-body text-xs text-gray-400 mt-0.5">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
