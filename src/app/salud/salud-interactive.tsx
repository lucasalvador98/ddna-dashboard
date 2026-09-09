'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Baby, Heart, Syringe } from 'lucide-react';
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

  const handleSelectYear = (periodo: string) => {
    setSelectedYear(prev => (prev === periodo ? null : periodo));
  };
  const clearYear = () => setSelectedYear(null);

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

  const tmiMissing = selectedYear !== null && tmiPoint === null;
  const rmmMissing = selectedYear !== null && rmmPoint === null;
  const tmneoMissing = selectedYear !== null && tmneoPoint === null;
  const tmposMissing = selectedYear !== null && tmposPoint === null;
  const nacMissing = selectedYear !== null && nacPoint === null;

  const tmiCambio = tmiPoint
    ? getCambio(mortalidadData, mortalidadData.indexOf(tmiPoint))
    : null;

  const cardKey = selectedYear ?? 'latest';

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
            Piloto: hacé click en un punto del gráfico de mortalidad infantil para filtrar las
            tarjetas por año.
          </p>
        )}
      </div>

      {/* KPI Cards (cross-filtered) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          key={`${cardKey}-tmi`}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
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
        </motion.div>
        <motion.div
          key={`${cardKey}-rmm`}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
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
        </motion.div>
        <motion.div
          key={`${cardKey}-nac`}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
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
        </motion.div>
        <motion.div
          key={`${cardKey}-tmneo`}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
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
        </motion.div>
        <motion.div
          key={`${cardKey}-tmpos`}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
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
        </motion.div>
      </div>

      {/* Charts: Mortalidad (el principal emite el año seleccionado) */}
      <SaludCharts
        variant="mortality"
        {...chartProps}
        onSelectYear={handleSelectYear}
        selectedYear={selectedYear}
      />
    </div>
  );
}
