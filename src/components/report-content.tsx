/**
 * report-content — Renders CriticalReport as styled HTML with KPI cards,
 * inline SVG bar charts, and enriched section layout.
 */

import type {
  ExecutiveReport,
  ReportKPI,
  DataQuality,
  CrossReference,
  Discrepancy,
} from '@/lib/informe-ejecutivo';
import clsx from 'clsx';

// ─── Props ──────────────────────────────────────────────────────

interface ReportContentProps {
  report?:
    | (ExecutiveReport & {
        kpis?: ReportKPI[];
        dataQuality?: DataQuality[];
        discrepancies?: Discrepancy[];
        crossReferences?: CrossReference[];
        suggestedImprovements?: string[];
      })
    | null;
  generatedAt?: string;
}

// ─── Category labels ───────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  pobreza: 'Pobreza',
  salud: 'Salud',
  educacion: 'Educación',
  inversion: 'Inversión Social',
  seguridad: 'Seguridad',
  seguridad_justicia: 'Seguridad y Justicia',
  demografia: 'Demografía',
  aprender: 'Aprender',
  anuario_educacion: 'Anuario Educación',
  deis: 'DEIS',
  salud_adolescente: 'Salud Adolescente',
  consumo: 'Consumo',
};

// ─── Axis accent colors ────────────────────────────────────────

const AXIS_COLORS: Record<string, { border: string; text: string; bg: string; bar: string }> = {
  pobreza: {
    border: 'border-[#BF1363]',
    text: 'text-[#BF1363]',
    bg: 'bg-[#BF1363]/5',
    bar: '#BF1363',
  },
  salud: {
    border: 'border-[#10B981]',
    text: 'text-[#10B981]',
    bg: 'bg-[#10B981]/5',
    bar: '#10B981',
  },
  educacion: {
    border: 'border-[#F3A712]',
    text: 'text-[#F3A712]',
    bg: 'bg-[#F3A712]/5',
    bar: '#F3A712',
  },
  inversion: {
    border: 'border-[#3777FF]',
    text: 'text-[#3777FF]',
    bg: 'bg-[#3777FF]/5',
    bar: '#3777FF',
  },
  seguridad_justicia: {
    border: 'border-[#7C3AED]',
    text: 'text-[#7C3AED]',
    bg: 'bg-[#7C3AED]/5',
    bar: '#7C3AED',
  },
  seguridad: {
    border: 'border-[#7C3AED]',
    text: 'text-[#7C3AED]',
    bg: 'bg-[#7C3AED]/5',
    bar: '#7C3AED',
  },
  demografia: {
    border: 'border-[#6B7280]',
    text: 'text-[#6B7280]',
    bg: 'bg-[#6B7280]/5',
    bar: '#6B7280',
  },
};

function axisColor(axis: string) {
  return AXIS_COLORS[axis] ?? AXIS_COLORS.demografia;
}

// ─── Highlight styles ──────────────────────────────────────────

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

// ─── Data quality styles ───────────────────────────────────────

const DQ_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  alta: { bg: 'bg-green-100', text: 'text-green-800', label: 'Alta' },
  media: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Media' },
  baja: { bg: 'bg-red-100', text: 'text-red-800', label: 'Baja' },
};

const SEVERITY_STYLES: Record<string, string> = {
  alta: 'border-red-400 bg-red-50',
  media: 'border-yellow-400 bg-yellow-50',
  baja: 'border-gray-300 bg-gray-50',
};

const SOURCE_BADGES: Record<string, { bg: string; label: string }> = {
  documento: { bg: 'bg-blue-100 text-blue-800', label: 'Documento' },
  web: { bg: 'bg-purple-100 text-purple-800', label: 'Web' },
  indicador: { bg: 'bg-orange-100 text-orange-800', label: 'Indicador' },
};

// ─── KPI Card ──────────────────────────────────────────────────

function KpiCard({ kpi }: { kpi: ReportKPI }) {
  const colors = axisColor(kpi.axis);
  const numericValue = parseFloat(kpi.value);
  const isPercent = kpi.unit === '%';
  // Bar fill: cap at 100 for %, use value/100 heuristic for ‰
  const barPct = isPercent ? Math.min(numericValue, 100) : Math.min((numericValue / 20) * 100, 100); // ‰ scale: 20‰ = 100%

  const trendIcon = kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→';

  const trendColor =
    kpi.trend === 'up'
      ? kpi.alert
        ? 'text-red-600'
        : 'text-green-600'
      : kpi.trend === 'down'
        ? kpi.alert
          ? 'text-green-600'
          : 'text-red-600'
        : 'text-gray-500';

  return (
    <div
      className={clsx(
        'bg-white rounded-xl border-l-4 p-4 shadow-sm flex flex-col gap-2',
        kpi.alert ? 'border-red-500' : colors.border
      )}
    >
      {/* Alert badge */}
      {kpi.alert && (
        <span className="self-start text-xs font-accent font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
          ⚠ Alerta crítica
        </span>
      )}

      {/* Axis tag */}
      <span className={clsx('text-xs font-accent uppercase tracking-wide', colors.text)}>
        {CATEGORY_LABELS[kpi.axis] ?? kpi.axis}
      </span>

      {/* Label */}
      <p className="font-body text-sm text-gray-600 leading-tight">{kpi.label}</p>

      {/* Value */}
      <div className="flex items-baseline gap-1">
        <span className="font-display text-2xl font-bold text-gray-900">{kpi.value}</span>
        <span className="font-body text-sm text-gray-500">{kpi.unit}</span>
      </div>

      {/* Bar chart (SVG) */}
      {!isNaN(numericValue) && (
        <svg width="100%" height="6" className="rounded-full overflow-hidden">
          <rect x="0" y="0" width="100%" height="6" fill="#F3F4F6" />
          <rect
            x="0"
            y="0"
            width={`${barPct}%`}
            height="6"
            fill={kpi.alert ? '#EF4444' : axisColor(kpi.axis).bar}
            rx="3"
          />
        </svg>
      )}

      {/* Trend + period */}
      <div className="flex items-center justify-between text-xs font-body">
        <span className="text-gray-400">{kpi.period}</span>
        <span className={clsx('font-semibold', trendColor)}>
          {trendIcon} {kpi.trendNote}
        </span>
      </div>

      {/* Source */}
      {kpi.source && (
        <p className="text-xs font-body text-gray-400 border-t border-gray-100 pt-2 mt-1 truncate">
          Fuente: {kpi.source}
        </p>
      )}
    </div>
  );
}

// ─── Highlights bar chart (inline SVG) ────────────────────────

function HighlightBars({ highlights }: { highlights: Array<{ type: string; text: string }> }) {
  // Extract numeric values from highlight text for mini bar visualization
  const parsed = highlights
    .map(h => {
      const match = h.text.match(/([\d.,]+)\s*(%|‰|casos)?/);
      const val = match ? parseFloat(match[1].replace(',', '.')) : null;
      return { ...h, numericVal: val };
    })
    .filter(h => h.numericVal !== null && h.numericVal > 0);

  if (parsed.length < 2) return null;

  const max = Math.max(...parsed.map(h => h.numericVal!));

  return (
    <div className="mt-4 space-y-1.5">
      <p className="font-accent text-xs uppercase tracking-wider text-gray-400 mb-2">
        Comparativa de hallazgos
      </p>
      {parsed.map((h, i) => {
        const pct = Math.round((h.numericVal! / max) * 100);
        const barColor =
          h.type === 'negative' ? '#EF4444' : h.type === 'positive' ? '#10B981' : '#9CA3AF';
        return (
          <div key={i} className="flex items-center gap-2 text-xs font-body">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: barColor }} />
            <svg width={`${pct}%`} height="8" style={{ minWidth: 8 }} className="flex-shrink-0">
              <rect x="0" y="0" width="100%" height="8" rx="4" fill={barColor} opacity="0.7" />
            </svg>
            <span className="text-gray-600 truncate">
              {h.numericVal}
              {h.text.match(/(%|‰)/)?.[0] ?? ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────

export function ReportContent({ report, generatedAt }: ReportContentProps) {
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

  const formattedDate = generatedAt
    ? new Date(generatedAt).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const kpis = (report as unknown as { kpis?: ReportKPI[] }).kpis;
  const alertKpis = kpis?.filter(k => k.alert) ?? [];
  const normalKpis = kpis?.filter(k => !k.alert) ?? [];

  return (
    <article className="space-y-6 print:space-y-4">
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="border-b border-gray-200 pb-4 print:pb-2">
        <h1 className="font-display text-2xl text-[#334155] print:text-xl">{report.title}</h1>
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

      {/* ── KPI Cards — alertas primero ─────────────────────── */}
      {kpis && kpis.length > 0 && (
        <section>
          {alertKpis.length > 0 && (
            <div className="mb-3">
              <p className="font-accent text-xs uppercase tracking-wider text-red-600 mb-2">
                Alertas críticas
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {alertKpis.map((kpi, i) => (
                  <KpiCard key={`alert-${i}`} kpi={kpi} />
                ))}
              </div>
            </div>
          )}
          {normalKpis.length > 0 && (
            <div>
              <p className="font-accent text-xs uppercase tracking-wider text-gray-400 mb-2">
                Indicadores clave
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {normalKpis.map((kpi, i) => (
                  <KpiCard key={`kpi-${i}`} kpi={kpi} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Overview ────────────────────────────────────────── */}
      <section className="bg-[#FFF8F2] border border-[#FFE2BF] rounded-lg p-4 print:bg-white print:border-gray-200">
        <h2 className="font-accent text-sm uppercase tracking-wider text-[#FF7F11] mb-2">
          Resumen Ejecutivo
        </h2>
        <div className="font-body text-gray-700 leading-relaxed whitespace-pre-line">
          {report.overview}
        </div>
      </section>

      {/* ── Category Sections ───────────────────────────────── */}
      {report.sections.map((section, idx) => {
        const colors = axisColor(section.category);
        return (
          <section
            key={`${section.category}-${idx}`}
            className={clsx(
              'border rounded-xl p-5 print:border-gray-300 print:break-inside-avoid',
              colors.border,
              colors.bg
            )}
          >
            {/* Section header */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <span className={clsx('font-accent text-xs uppercase tracking-wider', colors.text)}>
                  {CATEGORY_LABELS[section.category] || section.category}
                </span>
                <h3 className="font-display text-lg text-[#334155] mt-0.5">{section.title}</h3>
              </div>
            </div>

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
                      HIGHLIGHT_STYLES[h.type] || HIGHLIGHT_STYLES.neutral
                    )}
                  >
                    <span
                      className={clsx(
                        'mt-1.5 w-2 h-2 rounded-full flex-shrink-0',
                        HIGHLIGHT_BADGES[h.type] || HIGHLIGHT_BADGES.neutral
                      )}
                    />
                    <span className="font-body text-sm">{h.text}</span>
                  </div>
                ))}

                {/* Mini bar chart from highlight values */}
                <HighlightBars highlights={section.highlights} />
              </div>
            )}
          </section>
        );
      })}

      {/* ── Data Quality ────────────────────────────────────── */}
      {report.dataQuality && report.dataQuality.length > 0 && (
        <section className="border border-gray-200 rounded-lg p-4">
          <h2 className="font-accent text-sm uppercase tracking-wider text-[#FF7F11] mb-3">
            Calidad de Datos por Categoría
          </h2>
          <div className="space-y-3">
            {report.dataQuality.map((dq, dqIdx) => {
              const style = DQ_STYLES[dq.rating] || DQ_STYLES.media;
              return (
                <div key={`dq-${dqIdx}`} className="flex items-start gap-3 text-sm">
                  <span
                    className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-accent font-semibold flex-shrink-0',
                      style.bg,
                      style.text
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

      {/* ── Discrepancies ───────────────────────────────────── */}
      {report.discrepancies && report.discrepancies.length > 0 && (
        <section className="border border-gray-200 rounded-lg p-4">
          <h2 className="font-accent text-sm uppercase tracking-wider text-red-600 mb-3">
            Discrepancias Detectadas
          </h2>
          <div className="space-y-3">
            {report.discrepancies.map((d, dIdx) => (
              <div
                key={`disc-${dIdx}`}
                className={clsx(
                  'border-l-4 rounded-r-lg p-3 text-sm',
                  SEVERITY_STYLES[d.severity] || SEVERITY_STYLES.baja
                )}
              >
                <p className="text-gray-800 font-medium">{d.description}</p>
                {d.sources.length > 0 && (
                  <p className="text-gray-500 mt-1 text-xs">Fuentes: {d.sources.join(', ')}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Cross-References ────────────────────────────────── */}
      {report.crossReferences && report.crossReferences.length > 0 && (
        <section className="border border-gray-200 rounded-lg p-4">
          <h2 className="font-accent text-sm uppercase tracking-wider text-[#334155] mb-3">
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
                      badge.bg
                    )}
                  >
                    {badge.label}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">{cr.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{cr.content}</p>
                    {cr.relevance && (
                      <p className="text-xs text-gray-400 mt-1 italic">{cr.relevance}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Suggested Improvements ──────────────────────────── */}
      {report.suggestedImprovements && report.suggestedImprovements.length > 0 && (
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

      {/* ── Conclusion ──────────────────────────────────────── */}
      <section className="bg-[#334155]/5 border border-[#334155]/20 rounded-lg p-4 print:bg-gray-50 print:border-gray-300">
        <h2 className="font-accent text-sm uppercase tracking-wider text-[#334155] mb-2">
          Conclusión
        </h2>
        <div className="font-body text-gray-700 leading-relaxed whitespace-pre-line">
          {report.conclusion}
        </div>
      </section>

      {/* ── Recommendations ─────────────────────────────────── */}
      {report.recommendations.length > 0 && (
        <section className="border border-gray-200 rounded-lg p-4">
          <h2 className="font-accent text-sm uppercase tracking-wider text-[#FF7F11] mb-3">
            Recomendaciones
          </h2>
          <ul className="space-y-2">
            {report.recommendations.map((rec, rIdx) => (
              <li key={`rec-${rIdx}`} className="flex items-start gap-3 font-body text-gray-700">
                <span className="w-6 h-6 rounded-full bg-[#FF7F11]/10 text-[#FF7F11] flex items-center justify-center flex-shrink-0 text-xs font-accent font-bold">
                  {rIdx + 1}
                </span>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Footer ──────────────────────────────────────────── */}
      {formattedDate && (
        <footer className="text-center text-xs text-gray-400 font-body border-t border-gray-100 pt-4 print:pt-2">
          Informe generado automáticamente por DDNA Dashboard — {formattedDate}
        </footer>
      )}

      <div className="hidden print:block text-xs text-gray-400 text-center mt-4">
        DDNA Córdoba — Informe Ejecutivo de Indicadores
      </div>
    </article>
  );
}
