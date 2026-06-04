/**
 * report-content — Renders the ExecutiveReport / CriticalReport as styled HTML.
 *
 * Pure presentational component (no 'use client' needed, but kept as
 * it's always used within the client modal).
 */

import type {
  ExecutiveReport,
  DataQuality,
  CrossReference,
  Discrepancy,
} from '@/lib/informe-ejecutivo';
import clsx from 'clsx';

// ─── Props ──────────────────────────────────────────────────────

interface ReportContentProps {
  report?:
    | (ExecutiveReport & {
        dataQuality?: DataQuality[];
        discrepancies?: Discrepancy[];
        crossReferences?: CrossReference[];
        suggestedImprovements?: string[];
      })
    | null;
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

// ─── Data Quality helpers ──────────────────────────────────────

const DQ_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  alta: { bg: 'bg-green-100', text: 'text-green-800', label: 'Alta' },
  media: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Media' },
  baja: { bg: 'bg-red-100', text: 'text-red-800', label: 'Baja' },
};

// ─── Discrepancy severity helpers ──────────────────────────────

const SEVERITY_STYLES: Record<string, string> = {
  alta: 'border-red-400 bg-red-50',
  media: 'border-yellow-400 bg-yellow-50',
  baja: 'border-gray-300 bg-gray-50',
};

// ─── Cross-reference source badges ─────────────────────────────

const SOURCE_BADGES: Record<string, { bg: string; label: string }> = {
  documento: { bg: 'bg-blue-100 text-blue-800', label: 'Documento' },
  web: { bg: 'bg-purple-100 text-purple-800', label: 'Web' },
  indicador: { bg: 'bg-orange-100 text-orange-800', label: 'Indicador' },
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

      {/* ── Data Quality Section ─────────────────────────────── */}
      {report.dataQuality && report.dataQuality.length > 0 && (
        <section className="border border-gray-200 rounded-lg p-4">
          <h2 className="font-accent text-sm uppercase tracking-wider text-[#FF7F11] mb-3">
            Calidad de Datos por Categoría
          </h2>
          <div className="space-y-3">
            {report.dataQuality.map((dq, dqIdx) => {
              const style = DQ_STYLES[dq.rating] || DQ_STYLES.media;
              return (
                <div
                  key={`dq-${dqIdx}`}
                  className="flex items-start gap-3 text-sm"
                >
                  <span
                    className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-accent font-semibold flex-shrink-0',
                      style.bg,
                      style.text,
                    )}
                  >
                    {style.label}
                  </span>
                  <div>
                    <span className="font-semibold text-gray-800">
                      {CATEGORY_LABELS[dq.category] || dq.category}
                    </span>
                    {dq.issues.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {dq.issues.map((issue, iIdx) => (
                          <li
                            key={`dq-issue-${iIdx}`}
                            className="text-gray-600 list-disc list-inside"
                          >
                            {issue}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Discrepancies Section ────────────────────────────── */}
      {report.discrepancies && report.discrepancies.length > 0 && (
        <section className="border border-gray-200 rounded-lg p-4">
          <h2 className="font-accent text-sm uppercase tracking-wider text-red-600 mb-3">
            Discrepancias Detectadas
          </h2>
          <div className="space-y-3">
            {report.discrepancies.map((d, dIdx) => {
              const severityStyle =
                SEVERITY_STYLES[d.severity] || SEVERITY_STYLES.baja;
              return (
                <div
                  key={`disc-${dIdx}`}
                  className={clsx(
                    'border-l-4 rounded-r-lg p-3 text-sm',
                    severityStyle,
                  )}
                >
                  <p className="text-gray-800 font-medium">
                    {d.description}
                  </p>
                  {d.sources.length > 0 && (
                    <p className="text-gray-500 mt-1 text-xs">
                      Fuentes: {d.sources.join(', ')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Cross-References Section ─────────────────────────── */}
      {report.crossReferences && report.crossReferences.length > 0 && (
        <section className="border border-gray-200 rounded-lg p-4">
          <h2 className="font-accent text-sm uppercase tracking-wider text-[#00074E] mb-3">
            Referencias Cruzadas
          </h2>
          <div className="space-y-3">
            {report.crossReferences.map((cr, crIdx) => {
              const badge = SOURCE_BADGES[cr.source] || SOURCE_BADGES.indicador;
              return (
                <div
                  key={`cr-${crIdx}`}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <span
                    className={clsx(
                      'inline-flex items-center px-2 py-0.5 rounded text-xs font-accent font-semibold flex-shrink-0',
                      badge.bg,
                    )}
                  >
                    {badge.label}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      {cr.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {cr.content}
                    </p>
                    {cr.relevance && (
                      <p className="text-xs text-gray-400 mt-1 italic">
                        {cr.relevance}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Suggested Improvements Section ──────────────────── */}
      {report.suggestedImprovements &&
        report.suggestedImprovements.length > 0 && (
          <section className="border border-gray-200 rounded-lg p-4">
            <h2 className="font-accent text-sm uppercase tracking-wider text-[#FF7F11] mb-3">
              Mejoras Sugeridas
            </h2>
            <ul className="space-y-2">
              {report.suggestedImprovements.map((imp, iIdx) => (
                <li
                  key={`imp-${iIdx}`}
                  className="flex items-start gap-3 font-body text-gray-700 text-sm"
                >
                  <span className="w-5 h-5 rounded-full bg-[#FF7F11]/10 text-[#FF7F11] flex items-center justify-center flex-shrink-0 text-xs font-accent font-bold">
                    {iIdx + 1}
                  </span>
                  <span className="leading-relaxed">{imp}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

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
