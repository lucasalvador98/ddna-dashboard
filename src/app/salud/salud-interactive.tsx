'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Baby, Heart, Info, Syringe, X } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { KpiCard } from '@/components/kpi-card';
import { ChartWithTable } from '@/components/charts/chart-with-table';
import { Badge } from '@/components/ui/badge';
import { SaludCharts } from './salud-charts';
import type { SaludChartsProps } from './salud-charts';

type SeriePoint = { periodo: string; valor: number };

// ─── Natalidad y fecundidad ──────────────────────────────────────
// Paleta: los mismos hex que SERIES_META y salud-charts (terracotta/azul/magenta)
// para no introducir colores nuevos en la pantalla.
const NATALIDAD_COLORS = {
  cordoba: '#C2410C',
  nacional: '#165DFF',
  adolescente: '#8A4B4B',
} as const;

/** Grupo resaltado en las barras: es el indicador de embarazo adolescente. */
const GRUPO_ADOLESCENTE = '15 a 19';

const TOOLTIP_STYLE = {
  backgroundColor: '#FFF',
  border: '1px solid #D8D5D3',
  borderRadius: '8px',
} as const;

/** Número con coma decimal para la prosa de la nota (12,8 en vez de 12.8). */
const decimal = (valor: number, digitos: number) => valor.toFixed(digitos).replace('.', ',');

export interface NatalidadFecundidadProps {
  /** Serie de natalidad (‰): filas { periodo, Córdoba, Nacional }. [] si no hay datos. */
  natalidadData: Record<string, unknown>[];
  /** Tasa de fecundidad (‰) por grupo de edad de la madre, ya ordenada por edad. */
  fecundidadEdadData: { grupo: string; tasa: number }[];
  /** Año de la serie de fecundidad por edad (hoy 2022), o null si no hay datos. */
  fecundidadAnio: string | null;
  /** Serie oficial del DEIS `Tasa fecundidad adolescente` (‰, 2015-2022). */
  fecundidadOficialData: { periodo: string; valor: number }[];
}

/**
 * Sección "Natalidad y fecundidad" de /salud:
 *
 * A) tasa de natalidad (‰) 2000-2024, Córdoba vs Nación;
 * B) tasa de fecundidad (‰) por edad de la madre, Córdoba (hoy 2022).
 *
 * La nota metodológica del final es parte del contenido, no un adorno: la tasa
 * por edad NO divide por las mujeres del grupo sino por la población total (ver
 * el comentario del denominador en scripts/load-fecundidad.mjs).
 */
export function NatalidadFecundidad({
  natalidadData,
  fecundidadEdadData,
  fecundidadAnio,
  fecundidadOficialData,
}: NatalidadFecundidadProps) {
  const primerAnio = natalidadData.length > 0 ? String(natalidadData[0].periodo) : null;
  const ultimoAnio =
    natalidadData.length > 0 ? String(natalidadData[natalidadData.length - 1].periodo) : null;

  // Una serie ausente no se dibuja (queda en null): no se rellena con ceros.
  const tieneCordoba = natalidadData.some(
    (row) => row['Córdoba'] !== null && row['Córdoba'] !== undefined
  );
  const tieneNacional = natalidadData.some(
    (row) => row['Nacional'] !== null && row['Nacional'] !== undefined
  );

  const tieneAdolescente = fecundidadEdadData.some((grupo) => grupo.grupo === GRUPO_ADOLESCENTE);

  // Dos claves en vez de un <Cell> por barra: el grupo 15 a 19 queda en su propia
  // serie para poder pintarlo distinto y, de paso, aparece en la leyenda.
  const fecundidadChartData = fecundidadEdadData.map((grupo) => ({
    grupo: grupo.grupo,
    tasa: grupo.grupo === GRUPO_ADOLESCENTE ? null : grupo.tasa,
    tasaAdolescente: grupo.grupo === GRUPO_ADOLESCENTE ? grupo.tasa : null,
  }));

  // Referencia oficial del mismo año que la serie calculada: mezclar años daría
  // una comparación que no corresponde a ningún período real.
  const calculadaAdolescente =
    fecundidadEdadData.find((grupo) => grupo.grupo === GRUPO_ADOLESCENTE) ?? null;
  const oficialMismoAnio =
    fecundidadAnio !== null
      ? fecundidadOficialData.find((punto) => punto.periodo === fecundidadAnio) ?? null
      : null;
  const rangoOficial =
    fecundidadOficialData.length > 0
      ? `${fecundidadOficialData[0].periodo}-${
          fecundidadOficialData[fecundidadOficialData.length - 1].periodo
        }`
      : null;
  const desvioOficial =
    oficialMismoAnio && calculadaAdolescente && oficialMismoAnio.valor > 0
      ? Math.round(
          (Math.abs(oficialMismoAnio.valor - calculadaAdolescente.tasa) / oficialMismoAnio.valor) *
            100
        )
      : null;

  return (
    <div className="space-y-6">
      {/* Gráfico A — Tasa de natalidad (‰), 2000-2024 */}
      {natalidadData.length > 0 && (tieneCordoba || tieneNacional) && (
        <ChartWithTable
          title="Tasa de natalidad (‰) — Córdoba vs Nación"
          subtitle={`Evolución ${primerAnio}-${ultimoAnio}: nacimientos por cada mil habitantes`}
          color="terracotta"
          fuente="DEIS / datos.gob.ar"
          data={natalidadData}
          dataKey="Córdoba"
          xAxisKey="periodo"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={natalidadData}
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#D8D5D3" />
                <XAxis dataKey="periodo" tick={{ fill: '#050506', fontSize: 12 }} />
                <YAxis
                  tick={{ fill: '#050506', fontSize: 12 }}
                  domain={[0, 'auto']}
                  tickFormatter={(v) => `${Number(v).toFixed(1)}‰`}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value, name) => [`${value ?? 0}‰`, name]}
                />
                <Legend />
                {tieneCordoba && (
                  <Line
                    type="monotone"
                    dataKey="Córdoba"
                    stroke={NATALIDAD_COLORS.cordoba}
                    strokeWidth={2}
                    dot={{ fill: NATALIDAD_COLORS.cordoba, r: 3 }}
                    name="Córdoba"
                    connectNulls
                  />
                )}
                {tieneNacional && (
                  <Line
                    type="monotone"
                    dataKey="Nacional"
                    stroke={NATALIDAD_COLORS.nacional}
                    strokeWidth={2}
                    dot={{ fill: NATALIDAD_COLORS.nacional, r: 3 }}
                    name="Nacional"
                    strokeDasharray="5 5"
                    connectNulls
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartWithTable>
      )}

      {/* Gráfico B — Tasa de fecundidad por edad de la madre */}
      {fecundidadEdadData.length > 0 && (
        <ChartWithTable
          title="Tasa de fecundidad por edad de la madre (‰)"
          subtitle={`Córdoba ${fecundidadAnio ?? ''} — nacimientos por cada mil personas del grupo de edad (no por mujeres: ver nota metodológica)`}
          color="magenta"
          fuente="DEIS + Censo 2022 (elaboración propia)"
          data={fecundidadEdadData}
          dataKey="tasa"
          xAxisKey="grupo"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={fecundidadChartData}
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#D8D5D3" />
                <XAxis dataKey="grupo" tick={{ fill: '#050506', fontSize: 11 }} interval={0} />
                <YAxis
                  tick={{ fill: '#050506', fontSize: 12 }}
                  domain={[0, 'auto']}
                  tickFormatter={(v) => `${Number(v).toFixed(1)}‰`}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value, name) => [
                    value === null || value === undefined ? '—' : `${Number(value).toFixed(2)}‰`,
                    name,
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="tasa"
                  name="Tasa de fecundidad"
                  fill={NATALIDAD_COLORS.cordoba}
                  radius={[4, 4, 0, 0]}
                />
                {tieneAdolescente && (
                  <Bar
                    dataKey="tasaAdolescente"
                    name={`${GRUPO_ADOLESCENTE} — embarazo adolescente`}
                    fill={NATALIDAD_COLORS.adolescente}
                    radius={[4, 4, 0, 0]}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartWithTable>
      )}

      {/* Nota metodológica — el denominador no es el de una tasa específica */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
        <h3 className="font-accent text-sm text-navy font-medium mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-magenta" />
          Nota metodológica
        </h3>
        <div className="font-body text-sm text-text-primary leading-relaxed space-y-3">
          <p>
            La <strong>tasa de fecundidad por edad de la madre</strong> de este gráfico{' '}
            <strong>
              no divide por las mujeres de esa edad, sino por la población total del grupo
            </strong>{' '}
            (ambos sexos). El Censo 2022 no publica edad × sexo cruzado y la serie oficial del DEIS
            usa esa misma convención, así que el denominador es el conteo censal del grupo completo
            y no hay ninguna estimación.
          </p>
          <p>
            <strong>
              Por eso esta serie NO es comparable con una tasa específica de fecundidad
            </strong>{' '}
            calculada sobre mujeres. La referencia comparable es la serie oficial{' '}
            <em>Tasa fecundidad adolescente</em> del DEIS
            {rangoOficial ? ` (${rangoOficial})` : ''}, que usa el mismo denominador
            {oficialMismoAnio && calculadaAdolescente && desvioOficial !== null ? (
              <>
                : para {oficialMismoAnio.periodo} la oficial es{' '}
                <strong>{decimal(oficialMismoAnio.valor, 1)}‰</strong> contra{' '}
                <strong>{decimal(calculadaAdolescente.tasa, 2)}‰</strong> calculada para 15 a 19
                (≈{desvioOficial}% de diferencia, porque el DEIS usa proyecciones poblacionales y no
                el conteo censal del Censo 2022).
              </>
            ) : (
              '.'
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            Con denominador de mujeres, la tasa de 15 a 19 en Córdoba daría ≈22,5‰, casi el doble
            del valor de este gráfico: por eso la comparación válida es contra la serie oficial del
            DEIS y no contra indicadores internacionales de fecundidad adolescente. La tasa de
            natalidad del gráfico de líneas es aparte (nacimientos sobre población total del año) y
            sí es comparable con las series del DEIS.
          </p>
        </div>
      </div>
    </div>
  );
}

export interface SaludInteractiveProps {
  mortalidadData: SeriePoint[];
  rmmData: SeriePoint[];
  tmneoData: SeriePoint[];
  tmposData: SeriePoint[];
  nacimientosData: SeriePoint[];
  chartProps: Omit<SaludChartsProps, 'variant' | 'onSelectYear' | 'selectedYear'>;
}

interface Cambio {
  value: string;
  tipo: 'up' | 'down' | 'neutral';
}

const getCambio = (series: SeriePoint[], index: number): Cambio | null => {
  if (index < 1) return null;
  const actual = series[index].valor;
  const anterior = series[index - 1].valor;
  const cambio = actual - anterior;
  return {
    value: cambio.toFixed(1),
    tipo: cambio < 0 ? ('down' as const) : cambio > 0 ? ('up' as const) : ('neutral' as const),
  };
};

const SERIES_META = {
  tmi: { title: 'Mortalidad infantil Córdoba', unit: '‰', color: '#C2410C' },
  rmm: { title: 'RMM Córdoba', unit: '‰', color: '#165DFF' },
  nac: { title: 'Nacimientos adolescentes', unit: '', color: '#8A4B4B' },
  tmneo: { title: 'Mortalidad Neonatal Córdoba', unit: '‰', color: '#B3541E' },
  tmpos: { title: 'Mortalidad Post-Neonatal Córdoba', unit: '‰', color: '#FF8C00' },
} as const;

type SerieKey = keyof typeof SERIES_META;

/**
 * Slot de tarjeta con morph (Patrón 2): al hacer clic, la tarjeta se expande
 * hacia el detalle compartiendo layoutId con el panel del overlay.
 * Mientras está expandida, deja un placeholder del mismo tamaño en la grilla.
 */
function MorphSlot({ id, expanded, onExpand, children }: { id: SerieKey; expanded: SerieKey | null; onExpand: () => void; children: ReactNode }) {
  if (expanded === id) {
    return <div aria-hidden className="min-h-[150px] rounded-xl border border-border/60 bg-card/40" />;
  }
  return (
    <motion.div
      layoutId={`kpi-${id}`}
      onClick={onExpand}
      className="cursor-pointer"
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Cross-filtering en /salud:
 * el chart principal de TMI emite el año clickeado y las 5 tarjetas KPI
 * muestran el valor correspondiente a ese año (o "—" si no hay dato).
 */
export function SaludInteractive({
  mortalidadData,
  rmmData,
  tmneoData,
  tmposData,
  nacimientosData,
  chartProps,
}: SaludInteractiveProps) {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<SerieKey | null>(null);

  const handleSelectYear = (periodo: string) => {
    setSelectedYear(prev => (prev === periodo ? null : periodo));
  };
  const clearYear = () => setSelectedYear(null);

  // Escape cierra el detalle expandido (Patrón 2)
  useEffect(() => {
    if (expanded === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);

  const pickPoint = (series: SeriePoint[]): SeriePoint | null => {
    if (selectedYear !== null) {
      return series.find(p => p.periodo === selectedYear) ?? null;
    }
    return series.length > 0 ? series[series.length - 1] : null;
  };

  const tmiPoint = pickPoint(mortalidadData);
  const rmmPoint = pickPoint(rmmData);
  const tmneoPoint = pickPoint(tmneoData);
  const tmposPoint = pickPoint(tmposData);
  const nacPoint = pickPoint(nacimientosData);

  const SERIES_DATA: Record<SerieKey, SeriePoint[]> = {
    tmi: mortalidadData,
    rmm: rmmData,
    nac: nacimientosData,
    tmneo: tmneoData,
    tmpos: tmposData,
  };

  const tmiMissing = selectedYear !== null && tmiPoint === null;
  const rmmMissing = selectedYear !== null && rmmPoint === null;
  const tmneoMissing = selectedYear !== null && tmneoPoint === null;
  const tmposMissing = selectedYear !== null && tmposPoint === null;
  const nacMissing = selectedYear !== null && nacPoint === null;

  const tmiCambio = tmiPoint
    ? getCambio(mortalidadData, mortalidadData.indexOf(tmiPoint))
    : null;

  return (
    <div className="space-y-6">
      {/* Filtro activo / hint */}
      <div className="flex items-center justify-end min-h-[28px]">
        {selectedYear !== null ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              onClick={clearYear}
              aria-label={`Quitar filtro de año ${selectedYear}`}
              className="cursor-pointer transition-opacity hover:opacity-80"
            >
              <Badge variant="secondary" className="px-3 py-1 text-xs">
                Filtrado: {selectedYear} ✕
              </Badge>
            </button>
          </motion.div>
        ) : (
          <p className="text-xs text-text-primary/50 font-body">
            Hacé click en un punto del gráfico para filtrar por año, o en una tarjeta para
            ver su serie completa.
          </p>
        )}
      </div>

      {/* KPI Cards (cross-filtered) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MorphSlot id="tmi" expanded={expanded} onExpand={() => setExpanded('tmi')}>
          <KpiCard
            title="Mortalidad infantil Córdoba"
            value={tmiPoint !== null ? `${tmiPoint.valor.toFixed(1)}‰` : '—'}
            subtitle={
              tmiMissing
                ? `Sin dato para ${selectedYear}`
                : `TMI - Córdoba ${tmiPoint?.periodo ?? ''}`
            }
            change={tmiCambio ? `${tmiCambio.value}‰` : undefined}
            changeType={tmiCambio?.tipo}
            icon={Baby}
            color="terracotta"
          />
        </MorphSlot>
        <MorphSlot id="rmm" expanded={expanded} onExpand={() => setExpanded('rmm')}>
          <KpiCard
            title="RMM Córdoba"
            value={rmmPoint !== null ? `${rmmPoint.valor.toFixed(1)}‰` : '—'}
            subtitle={
              rmmMissing
                ? `Sin dato para ${selectedYear}`
                : `RMM ${rmmPoint?.periodo ?? ''} — Mortalidad posneonatal`
            }
            icon={Syringe}
            color="blue"
          />
        </MorphSlot>
        <MorphSlot id="nac" expanded={expanded} onExpand={() => setExpanded('nac')}>
          <KpiCard
            title="Nacimientos adolescentes"
            value={nacPoint !== null ? nacPoint.valor.toLocaleString('es-AR') : '—'}
            subtitle={
              nacPoint !== null
                ? `Registrados en ${nacPoint.periodo}`
                : nacMissing
                  ? `Sin dato para ${selectedYear}`
                  : 'Sin datos disponibles'
            }
            icon={Heart}
            color="magenta"
          />
        </MorphSlot>
        <MorphSlot id="tmneo" expanded={expanded} onExpand={() => setExpanded('tmneo')}>
          <KpiCard
            title="Mortalidad Neonatal Córdoba"
            value={tmneoPoint !== null ? `${tmneoPoint.valor.toFixed(1)}‰` : '—'}
            subtitle={
              tmneoMissing
                ? `Sin dato para ${selectedYear}`
                : `TMNEO ${tmneoPoint?.periodo ?? ''} — Tasa mortalidad neonatal`
            }
            icon={Baby}
            color="orange"
          />
        </MorphSlot>
        <MorphSlot id="tmpos" expanded={expanded} onExpand={() => setExpanded('tmpos')}>
          <KpiCard
            title="Mortalidad Post-Neonatal Córdoba"
            value={tmposPoint !== null ? `${tmposPoint.valor.toFixed(1)}‰` : '—'}
            subtitle={
              tmposMissing
                ? `Sin dato para ${selectedYear}`
                : `TMPOS ${tmposPoint?.periodo ?? ''} — Tasa mortalidad post-neonatal`
            }
            icon={Syringe}
            color="amber"
          />
        </MorphSlot>
      </div>

      {/* Charts: Mortalidad (el principal emite el año seleccionado) */}
      <SaludCharts
        variant="mortality"
        {...chartProps}
        onSelectYear={handleSelectYear}
        selectedYear={selectedYear}
      />

      {/* Patrón 2 — detalle expandido: la tarjeta hace morph hacia este panel (layoutId compartido) */}
      <AnimatePresence>
        {expanded !== null && (
          <motion.div
            key="detail-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpanded(null)}
          >
            <motion.div
              layoutId={`kpi-${expanded}`}
              role="dialog"
              aria-modal="true"
              aria-label={SERIES_META[expanded].title}
              className="w-full max-w-lg rounded-xl bg-card p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              {(() => {
                const meta = SERIES_META[expanded];
                const serie = SERIES_DATA[expanded];
                const point = pickPoint(serie);
                return (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-body text-muted-foreground">
                          {selectedYear !== null ? `Filtrado: ${selectedYear}` : 'Último disponible'}
                        </p>
                        <h3 className="font-display text-lg text-slate-800">{meta.title}</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpanded(null)}
                        aria-label="Cerrar detalle"
                        className="cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-muted"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-2 text-3xl font-display text-navy">
                      {point !== null
                        ? meta.unit === ''
                          ? point.valor.toLocaleString('es-AR')
                          : `${point.valor.toFixed(1)}${meta.unit}`
                        : '—'}
                    </p>
                    <div className="mt-4 h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={serie} margin={{ top: 8, right: 12, bottom: 0, left: -10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#D8D5D3" />
                          <XAxis dataKey="periodo" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                          <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="valor"
                            stroke={meta.color}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                            isAnimationActive={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {serie.length} puntos históricos · fuente: indicadores DDNA
                    </p>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
