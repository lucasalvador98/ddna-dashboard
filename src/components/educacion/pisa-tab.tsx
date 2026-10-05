'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Trophy, GraduationCap, Target, Users, Info } from 'lucide-react';
import type { Indicador } from '@/lib/use-dashboard-data';
import { EmptyState } from '@/components/empty-state';

// ─── Palette (misma familia que educacion-charts) ───────────────

const COLORS = {
  amber: '#FF8C00',
  blue: '#165DFF',
  oecd: '#356B6B',
};

// ─── Types ───────────────────────────────────────────────────────

type ContextFormat = 'percent' | 'hours' | 'points';
type ContextTone = 'alert' | 'good' | 'neutral';

interface AreaRow {
  label: string;
  cordoba: number | null;
  nacional: number | null;
  oecd: number | null;
  diferencia: number | null;
}

interface ContextConfig {
  id: string;
  label: string;
  hint: string;
  match: string;
  format: ContextFormat;
  tone: ContextTone;
}

// ─── Config ──────────────────────────────────────────────────────

const AREAS: { label: string; match: string }[] = [
  { label: 'Ciencia', match: 'Ciencia - Puntaje promedio' },
  { label: 'Lectura', match: 'Lectura - Puntaje promedio' },
  { label: 'Matemática', match: 'Matemática - Puntaje promedio' },
  {
    label: 'Aprendizaje en el mundo digital',
    match: 'Aprendizaje en el mundo digital - Puntaje promedio',
  },
];

const LEVEL_AREAS = ['Ciencia', 'Lectura', 'Matemática'] as const;

const CONTEXT_ITEMS: ContextConfig[] = [
  {
    id: 'llego-tarde',
    label: 'Llegó tarde',
    hint: 'Ausentismo y puntualidad',
    match: 'Llegó tarde',
    format: 'percent',
    tone: 'alert',
  },
  {
    id: 'bullying',
    label: 'Víctimas de bullying',
    hint: 'Convivencia escolar',
    match: 'Víctimas de bullying (%)',
    format: 'percent',
    tone: 'alert',
  },
  {
    id: 'ciberbullying',
    label: 'Víctimas de ciberbullying',
    hint: 'Convivencia escolar',
    match: 'Víctimas de ciberbullying (%)',
    format: 'percent',
    tone: 'alert',
  },
  {
    id: 'dispositivos-ocio',
    label: 'Dispositivos para ocio',
    hint: 'Uso de pantallas (digital)',
    match: 'Dispositivos para ocio',
    format: 'hours',
    tone: 'neutral',
  },
  {
    id: 'distraidos',
    label: 'Distraídos por dispositivos',
    hint: 'Clima de clase (digital)',
    match: 'Compañeros distraídos',
    format: 'percent',
    tone: 'alert',
  },
  {
    id: 'brecha',
    label: 'Brecha socioeconómica',
    hint: 'Equidad (Ciencia)',
    match: 'Brecha aventajados vs. desventajados',
    format: 'points',
    tone: 'neutral',
  },
  {
    id: 'mentalidad',
    label: 'Con mentalidad de crecimiento',
    hint: 'Actitudes',
    match: 'Con mentalidad de crecimiento',
    format: 'percent',
    tone: 'good',
  },
];

const toneCard: Record<ContextTone, string> = {
  alert: 'border-l-error',
  good: 'border-l-success',
  neutral: 'border-l-navy',
};

const toneValue: Record<ContextTone, string> = {
  alert: 'text-error',
  good: 'text-success',
  neutral: 'text-navy',
};

// ─── Helpers ─────────────────────────────────────────────────────

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Busca el valor de un indicador por substring (insensible a acentos) y región. */
function findValue(data: Indicador[], match: string, region: string): number | null {
  const needle = normalize(match);
  const row = data.find(
    d => d.region === region && normalize(d.indicador_nombre).includes(needle)
  );
  if (!row) return null;
  const value = Number(row.valor);
  return Number.isFinite(value) ? value : null;
}

function formatDiff(value: number): string {
  const rounded = Math.round(value);
  if (rounded === 0) return '0';
  return `${rounded > 0 ? '+' : ''}${rounded.toLocaleString('es-AR')}`;
}

function formatContext(value: number, format: ContextFormat): string {
  if (format === 'percent') return `${Math.round(value)}%`;
  if (format === 'hours') {
    return `${value.toLocaleString('es-AR', { maximumFractionDigits: 1 })} h/día`;
  }
  return `${Math.round(value)} pts`;
}

// ─── Section heading (mismo lenguaje que SectionHeader) ─────────

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-lg bg-amber/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-amber" />
      </div>
      <div>
        <h2 className="font-display text-xl text-navy tracking-tight">{title}</h2>
        {subtitle && (
          <p className="font-body text-xs text-text-primary/70 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

/** Barra de proficiencia: valor con mini barra (0-100%). */
function ProficienciaCell({ value, color }: { value: number | null; color: string }) {
  if (value === null) {
    return <p className="text-center text-sm text-text-primary/40">—</p>;
  }
  const width = Math.min(100, Math.max(0, value));
  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className="text-sm font-bold text-navy">{Math.round(value)}%</p>
      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────

interface PisaTabProps {
  pisaData: Indicador[];
}

export default function PisaTab({ pisaData }: PisaTabProps) {
  if (pisaData.length === 0) {
    return (
      <EmptyState
        title="No hay datos de PISA 2025 disponibles"
        description="No se encontraron indicadores PISA 2025 (categoria=educacion, periodo=2025)."
      />
    );
  }

  // ── Puntaje promedio (headline) ───────────────────────────────
  const areaRows: AreaRow[] = AREAS.map(area => ({
    label: area.label,
    cordoba: findValue(pisaData, area.match, 'Córdoba'),
    nacional: findValue(pisaData, area.match, 'Nacional'),
    oecd: findValue(pisaData, area.match, 'OCDE promedio'),
    diferencia: findValue(
      pisaData,
      area.match.replace('Puntaje promedio', 'Diferencia vs. nacional (puntos)'),
      'Córdoba'
    ),
  }));

  const comparableAreas = areaRows.filter(r => r.cordoba !== null && r.nacional !== null);
  const beatenAreas = comparableAreas.filter(
    r => r.cordoba !== null && r.nacional !== null && r.cordoba > r.nacional
  );
  const headline =
    comparableAreas.length > 0
      ? beatenAreas.length === comparableAreas.length
        ? 'Córdoba supera al promedio nacional'
        : `Córdoba supera al promedio nacional en ${beatenAreas.length} de ${comparableAreas.length} áreas evaluadas`
      : null;

  const chartData = areaRows.map(r => ({
    area: r.label,
    'Córdoba': r.cordoba,
    'Nacional': r.nacional,
  }));
  const hasPoints = areaRows.some(r => r.cordoba !== null || r.nacional !== null);

  // ── Proficiencia (Nivel 2+) ───────────────────────────────────
  const levelRows = LEVEL_AREAS.map(area => ({
    label: area,
    cordoba: findValue(pisaData, `${area} - Nivel 2+ (%)`, 'Córdoba'),
    nacional: findValue(pisaData, `${area} - Nivel 2+ (%)`, 'Nacional'),
    oecd: findValue(pisaData, `${area} - Nivel 2+ (%)`, 'OCDE promedio'),
  }));
  const hasLevels = levelRows.some(
    r => r.cordoba !== null || r.nacional !== null || r.oecd !== null
  );

  // ── Contexto (Nacional) ───────────────────────────────────────
  const contextRows = CONTEXT_ITEMS.map(item => ({
    ...item,
    valor: findValue(pisaData, item.match, 'Nacional'),
    oecd: findValue(pisaData, item.match, 'OCDE promedio'),
  }));
  const hasContext = contextRows.some(r => r.valor !== null);

  // ── Tooltip base ──────────────────────────────────────────────
  const tooltipStyle = {
    backgroundColor: '#FFF',
    border: '1px solid #D8D5D3',
    borderRadius: '8px',
  };

  return (
    <div className="space-y-8">
      {/* 0) Nota metodológica: cómo se lee la comparación */}
      <section>
        <SectionTitle
          icon={Info}
          title="Cómo leer estos resultados"
          subtitle="Una aclaración metodológica antes de comparar"
        />
        <div className="bg-white rounded-xl border border-border p-6 space-y-4">
          <p className="text-sm text-text-primary">
            Las Pruebas PISA 2025 <strong>no cuentan con un desglose oficial de puntajes para
            todas las provincias</strong>: la evaluación internacional mide al país en su conjunto.
            Solo tres jurisdicciones ampliaron su muestra de manera voluntaria para obtener
            resultados representativos propios: <strong>Ciudad de Buenos Aires (CABA), Córdoba y
            Mendoza</strong>.
          </p>
          <p className="text-sm text-text-primary">
            Córdoba participó como <strong>Región Adjudicada</strong>: la OCDE evalúa y reconoce
            formalmente esa muestra como un sistema educativo participante propio, sujeto a sus
            estándares de calidad, de modo que sus resultados son comparables internacionalmente
            por sí mismos.
          </p>
          <p className="text-sm text-text-primary bg-outspace/50 rounded-lg p-4">
            <strong>Por qué la comparación no es estrictamente equivalente:</strong> el resultado
            nacional surge de una muestra representativa de todo el país, mientras que el de
            Córdoba surge de una muestra provincial propia. Parte de la diferencia observada puede
            reflejar esa diferencia de metodología y de composición de la muestra, además de
            diferencias reales de desempeño.
          </p>
        </div>
      </section>

      {/* 1) Headline: puntaje promedio */}
      <section>
        <SectionTitle
          icon={GraduationCap}
          title="Puntaje promedio por área"
          subtitle="Escala PISA 0-500 — Córdoba (Región Adjudicada) vs. Nacional"
        />
        <div className="bg-white rounded-xl border border-border p-6 space-y-6">
          {headline && (
            <div className="flex items-center gap-3 bg-success/10 border border-success/30 text-success rounded-lg px-4 py-3">
              <Trophy className="w-5 h-5 shrink-0" />
              <p className="text-sm font-semibold">{headline}</p>
            </div>
          )}

          {hasPoints && (
            <div className="h-72">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                  barGap={6}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#D8D5D3" />
                  <XAxis
                    dataKey="area"
                    tick={{ fill: '#050506', fontSize: 11 }}
                    angle={-18}
                    textAnchor="end"
                    height={72}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fill: '#050506', fontSize: 12 }}
                    domain={[0, 500]}
                    tickFormatter={v => `${v}`}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={value => [`${Number(value)} pts`, 'Puntaje']}
                  />
                  <Legend />
                  <Bar dataKey="Córdoba" fill={COLORS.amber} name="Córdoba" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="Nacional" fill={COLORS.blue} name="Nacional" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {hasPoints && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-text-primary/60 border-b border-border">
                    <th className="py-2 pr-4 font-medium">Área</th>
                    <th className="py-2 pr-4 font-medium text-right">Córdoba</th>
                    <th className="py-2 pr-4 font-medium text-right">Nacional</th>
                    <th className="py-2 pr-4 font-medium text-right">OCDE promedio</th>
                    <th className="py-2 font-medium text-right">Diferencia vs. nacional</th>
                  </tr>
                </thead>
                <tbody>
                  {areaRows.map(r => (
                    <tr key={r.label} className="border-b border-border/60 last:border-b-0">
                      <td className="py-3 pr-4 font-semibold text-navy">{r.label}</td>
                      <td className="py-3 pr-4 text-right font-display text-lg text-navy">
                        {r.cordoba ?? '—'}
                      </td>
                      <td className="py-3 pr-4 text-right font-display text-lg text-text-primary">
                        {r.nacional ?? '—'}
                      </td>
                      <td className="py-3 pr-4 text-right text-text-primary/60">
                        {r.oecd ?? '—'}
                      </td>
                      <td className="py-3 text-right">
                        {r.diferencia === null ? (
                          <span className="text-text-primary/50">—</span>
                        ) : (
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                              r.diferencia > 0
                                ? 'bg-success/10 text-success'
                                : 'bg-border/40 text-text-primary'
                            }`}
                          >
                            {formatDiff(r.diferencia)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-text-primary/50 mt-3">
                El dataset no incluye puntajes promedio de la OCDE para estas áreas; la columna se
                muestra como referencia de disponibilidad.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 2) Proficiencia: % Nivel 2+ */}
      {hasLevels && (
        <section>
          <SectionTitle
            icon={Target}
            title="Proficiencia: % con Nivel 2 o más"
            subtitle="Porcentaje de estudiantes que alcanza el nivel mínimo de competencia (Nivel 2)"
          />
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="grid grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))] gap-4 text-xs uppercase tracking-wide text-text-primary/60 font-medium mb-5">
              <span>Área</span>
              <span className="text-center">Córdoba</span>
              <span className="text-center">Nacional</span>
              <span className="text-center">OCDE promedio</span>
            </div>
            <div className="space-y-5">
              {levelRows.map(r => (
                <div
                  key={r.label}
                  className="grid grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))] gap-4 items-center"
                >
                  <p className="text-sm font-semibold text-navy">{r.label}</p>
                  <ProficienciaCell value={r.cordoba} color={COLORS.amber} />
                  <ProficienciaCell value={r.nacional} color={COLORS.blue} />
                  <ProficienciaCell value={r.oecd} color={COLORS.oecd} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3) Contexto nacional */}
      {hasContext && (
        <section>
          <SectionTitle
            icon={Users}
            title="Contexto nacional"
            subtitle="Indicadores de contexto PISA 2025 (Argentina)"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contextRows.map(item => {
              if (item.valor === null) return null;
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border border-border border-l-4 p-4 ${toneCard[item.tone]}`}
                >
                  <p className="font-accent text-xs text-text-primary tracking-wide uppercase">
                    {item.label}
                  </p>
                  <p className={`font-display text-3xl mt-1 ${toneValue[item.tone]}`}>
                    {formatContext(item.valor, item.format)}
                  </p>
                  <p className="font-body text-xs text-text-primary/60 mt-1">{item.hint}</p>
                  {item.oecd !== null && (
                    <p className="font-body text-xs text-text-primary/50 mt-2 pt-2 border-t border-border/60">
                      OCDE promedio: {formatContext(item.oecd, item.format)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <p className="font-body text-xs text-text-primary/50 mt-2">
            Indicadores de contexto referidos a Argentina (Nacional). Solo se muestran los
            disponibles en el dataset.
          </p>
        </section>
      )}

      {/* Footer / fuente */}
      <p className="text-right text-xs text-text-primary/50">
        Fuente: OECD PISA 2025 (Vol. I) + Córdoba (Región Adjudicada)
      </p>
    </div>
  );
}