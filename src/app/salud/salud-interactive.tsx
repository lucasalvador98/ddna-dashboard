'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Baby, Heart, Syringe, X } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { KpiCard } from '@/components/kpi-card';
import { Badge } from '@/components/ui/badge';
import { SaludCharts } from './salud-charts';
import type { SaludChartsProps } from './salud-charts';

type SeriePoint = { periodo: string; valor: number };

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
  tmi: { title: 'Mortalidad infantil Córdoba', unit: '‰', color: '#E07A5F' },
  rmm: { title: 'RMM Córdoba', unit: '‰', color: '#3777FF' },
  nac: { title: 'Nacimientos adolescentes', unit: '', color: '#BF1363' },
  tmneo: { title: 'Mortalidad Neonatal Córdoba', unit: '‰', color: '#FF7F11' },
  tmpos: { title: 'Mortalidad Post-Neonatal Córdoba', unit: '‰', color: '#F3A712' },
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
 * Piloto de cross-filtering en /salud:
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
            Piloto: hacé click en un punto del gráfico para filtrar por año, o en una tarjeta para
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
                          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
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
