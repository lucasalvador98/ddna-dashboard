/**
 * report-content — Renders the ExecutiveReport as styled HTML.
 *
 * Pure presentational component (no 'use client' needed, but kept as
 * it's always used within the client modal).
 */

import type { ExecutiveReport } from '@/lib/informe-ejecutivo';
import clsx from 'clsx';

// ─── Props ──────────────────────────────────────────────────────

interface ReportContentProps {
  report?: ExecutiveReport | null;
  generatedAt?: string;
}

// ─── Icons for categories ──────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  pobreza: 'Pobreza',
  salud: 'Salud',
  educacion: 'Educación',
  inversion: 'Inversión Social',
  seguridad: 'Seguridad',
  demografia: 'Demografía',
};

// ─── Highlight colors ──────────────────────────────────────────

const HIGHLIGHT_STYLES: Record<string, string> = {
  positive: 'text-green-700 bg-green-50 border-green-200',
  negative: 'text-red-700 bg-red-50 border-red-200',
  neutral: 'text-gray-700 bg-gray-50 border-gray-200',
};

const HIGHLIGHT_BADGES: Record<string, string> = {
  positive: 'bg-green-500',
  negative: 'bg-red-500',
  neutral: 'bg-gray-400',
};

// ─── Component ─────────────────────────────────────────────────

export function ReportContent({ report, generatedAt }: ReportContentProps) {
  // ── Empty state ──────────────────────────────────────────────
  if (!report) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4 text-gray-300">📋</div>
        <p className="font-body text-gray-500 text-lg">
          No se pudo generar el informe. Intente de nuevo.
        </p>
      </div>
    );
  }

  // ── Format timestamp ─────────────────────────────────────────
  const formattedDate = generatedAt
    ? new Date(generatedAt).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <article className="space-y-6 print:space-y-4">
      {/* Title */}
      <header className="border-b border-gray-200 pb-4 print:pb-2">
        <h1 className="font-display text-2xl text-[#00074E] print:text-xl">
          {report.title}
        </h1>
        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 font-body">
          <span>{report.date}</span>
          {formattedDate && (
            <>
              <span className="text-gray-300">|</span>
              <span>Generado: {formattedDate}</span>
            </>
          )}
        </div>
      </header>

      {/* Overview */}
      <section className="bg-[#FFF8F2] border border-[#FFE2BF] rounded-lg p-4 print:bg-white print:border-gray-200">
        <h2 className="font-accent text-sm uppercase tracking-wider text-[#FF7F11] mb-2">
          Resumen Ejecutivo
        </h2>
        <div className="font-body text-gray-700 leading-relaxed whitespace-pre-line">
          {report.overview}
        </div>
      </section>

      {/* Category Sections */}
      {report.sections.map((section, idx) => (
        <section
          key={`${section.category}-${idx}`}
          className="border border-gray-200 rounded-lg p-4 print:border-gray-300 print:break-inside-avoid"
        >
          <h3 className="font-display text-lg text-[#00074E] mb-1">
            {section.title}
          </h3>
          {section.category && (
            <span className="inline-block font-accent text-xs uppercase tracking-wider text-[#FF7F11] mb-3">
              {CATEGORY_LABELS[section.category] || section.category}
            </span>
          )}

          {/* Analysis text */}
          <div className="font-body text-gray-700 leading-relaxed whitespace-pre-line mb-4">
            {section.analysis}
          </div>

          {/* Highlights */}
          {section.highlights.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-accent text-xs uppercase tracking-wider text-gray-500">
                Destacados
              </h4>
              {section.highlights.map((h, hIdx) => (
                <div
                  key={`highlight-${hIdx}`}
                  className={clsx(
                    'flex items-start gap-3 border-l-4 rounded-r-lg p-3',
                    HIGHLIGHT_STYLES[h.type] || HIGHLIGHT_STYLES.neutral,
                  )}
                >
                  <span
                    className={clsx(
                      'mt-1.5 w-2 h-2 rounded-full flex-shrink-0',
                      HIGHLIGHT_BADGES[h.type] || HIGHLIGHT_BADGES.neutral,
                    )}
                  />
                  <span className="font-body text-sm">{h.text}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {/* Conclusion */}
      <section className="bg-[#00074E]/5 border border-[#00074E]/20 rounded-lg p-4 print:bg-gray-50 print:border-gray-300">
        <h2 className="font-accent text-sm uppercase tracking-wider text-[#00074E] mb-2">
          Conclusión
        </h2>
        <div className="font-body text-gray-700 leading-relaxed whitespace-pre-line">
          {report.conclusion}
        </div>
      </section>

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <section className="border border-gray-200 rounded-lg p-4">
          <h2 className="font-accent text-sm uppercase tracking-wider text-[#FF7F11] mb-3">
            Recomendaciones
          </h2>
          <ul className="space-y-2">
            {report.recommendations.map((rec, rIdx) => (
              <li
                key={`rec-${rIdx}`}
                className="flex items-start gap-3 font-body text-gray-700"
              >
                <span className="w-6 h-6 rounded-full bg-[#FF7F11]/10 text-[#FF7F11] flex items-center justify-center flex-shrink-0 text-xs font-accent font-bold">
                  {rIdx + 1}
                </span>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Footer */}
      {formattedDate && (
        <footer className="text-center text-xs text-gray-400 font-body border-t border-gray-100 pt-4 print:pt-2">
          Informe generado automáticamente por DDNA Dashboard — {formattedDate}
        </footer>
      )}

      {/* Print-only note */}
      <div className="hidden print:block text-xs text-gray-400 text-center mt-4">
        DDNA Córdoba — Informe Ejecutivo de Indicadores
      </div>
    </article>
  );
}
