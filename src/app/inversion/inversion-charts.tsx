'use client';

import { useState, useMemo } from 'react';
import { Coins, TrendingUp } from 'lucide-react';
import {
  formatInversionValue,
  getInversionTotal,
  isEducacionCategory,
  isSaludCategory,
  formatInversionChange,
} from '@/lib/format-inversion';
import { KpiCard } from '@/components/kpi-card';
import { ChartWithTable } from '@/components/charts/chart-with-table';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import clsx from 'clsx';

// ─── Types ──────────────────────────────────────────────────────

export interface InversionRow {
  id: string;
  indicador_nombre: string;
  categoria: string;
  valor: number;
  unidad: string;
  periodo: string;
  region: string;
  desglose: Record<string, unknown>;
  fuente?: string;
}

// ─── Color Palette ──────────────────────────────────────────────

const COLORS = {
  terracotta: '#E07A5F',
  amber: '#F3A712',
  blue: '#3777FF',
  magenta: '#BF1363',
  green: '#10B981',
  navy: '#334155',
};

const AREA_COLORS: Record<string, string> = {
  Educación: COLORS.blue,
  Salud: COLORS.terracotta,
  'Desarrollo Social': COLORS.amber,
  'Niñez y Adolescencia': COLORS.magenta,
  Otros: COLORS.green,
};

const AREA_ORDER = ['Educación', 'Salud', 'Desarrollo Social', 'Niñez y Adolescencia', 'Otros'];

// ─── Formatters ─────────────────────────────────────────────────

function formatBillionsLabel(v: number): string {
  if (v >= 1_000_000_000_000) {
    const b = v / 1_000_000_000_000;
    return `$${b.toFixed(1)}B`;
  }
  if (v >= 1_000_000_000) {
    const bb = v / 1_000_000_000;
    return `$${bb.toFixed(1)} mil M`;
  }
  if (v >= 1_000_000) {
    const m = v / 1_000_000;
    return `$${m.toFixed(0)} M`;
  }
  return `$${v.toLocaleString('en-US')}`;
}

function tooltipBillions(v: unknown): [string, string] {
  const val = typeof v === 'number' ? v : Number(v);

  if (val >= 1_000_000_000_000) {
    return [
      `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} billones`,
      '',
    ];
  }
  if (val >= 1_000_000_000) {
    return [
      `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} mil millones`,
      '',
    ];
  }
  if (val >= 1_000_000) {
    return [
      `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} millones`,
      '',
    ];
  }
  return [`$${val.toLocaleString('en-US')}`, ''];
}

// ─── Props ──────────────────────────────────────────────────────

interface InversionChartsProps {
  inversionData: InversionRow[];
  periods: string[];
  evolutionData: Record<string, unknown>[];
}

// ─── Component ──────────────────────────────────────────────────

export function InversionCharts({ inversionData, periods, evolutionData }: InversionChartsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const activePeriod = selectedPeriod ?? periods[0] ?? null;

  // ── Filter data by selected period ──────────────────────────

  const filteredData = useMemo(() => {
    if (!activePeriod || activePeriod === 'all') return inversionData;
    return inversionData.filter(d => d.periodo === activePeriod);
  }, [inversionData, activePeriod]);

  // ── Aggregation: by area for the selected period ────────────

  const inversionArea = useMemo(() => {
    const porArea = new Map<string, number>();
    for (const d of filteredData) {
      const area = (d.desglose?.area as string) || 'Otros';
      porArea.set(area, (porArea.get(area) || 0) + Number(d.valor));
    }
    return AREA_ORDER.map(name => ({
      name,
      value: porArea.get(name) || 0,
    }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  // ── KPI values ──────────────────────────────────────────────

  const total = getInversionTotal(filteredData, activePeriod ?? undefined);

  const educacionTotal = useMemo(() => {
    return inversionArea
      .filter(d => isEducacionCategory(d.name))
      .reduce((sum, d) => sum + d.value, 0);
  }, [inversionArea]);

  const saludTotal = useMemo(() => {
    return inversionArea.filter(d => isSaludCategory(d.name)).reduce((sum, d) => sum + d.value, 0);
  }, [inversionArea]);

  // ── Change badge ────────────────────────────────────────────

  const changeData = useMemo(() => {
    if (periods.length < 2) return null;
    const currentPeriod = periods[0];
    const previousPeriod = periods[1];
    const currentTotal = getInversionTotal(inversionData, currentPeriod);
    const previousTotal = getInversionTotal(inversionData, previousPeriod);
    if (!previousTotal) return null;
    const cambio = ((currentTotal - previousTotal) / previousTotal) * 100;
    return {
      value: formatInversionChange(cambio),
      type: (cambio > 0 ? 'up' : cambio < 0 ? 'down' : 'neutral') as 'up' | 'down' | 'neutral',
    };
  }, [inversionData, periods]);

  // ── Empty state ─────────────────────────────────────────────

  if (inversionData.length === 0) {
    return (
      <div className="bg-gray-50 p-8 rounded text-center text-gray-500">
        Sin datos disponibles
      </div>
    );
  }

  return (
    <>
      {/* Period selector pill buttons */}
      {periods.length > 1 && (
        <div className="flex gap-2 flex-wrap items-center" role="group" aria-label="Selector de período">
          {periods.map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={clsx(
                'px-4 py-2 rounded-full text-sm font-accent transition-all',
                activePeriod === period
                  ? 'bg-[#334155] text-white shadow-md'
                  : 'bg-white text-[#4D4D4D] border border-[#E0E0E0] hover:border-[#334155] hover:text-[#334155]'
              )}
            >
              {period}
            </button>
          ))}
          {String(activePeriod) === '2025' && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              ⚠️ Acumulado a marzo
            </span>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title={`Inversión en Infancia ${activePeriod || ''}`}
          value={formatInversionValue(total)}
          subtitle="Pesos — presupuesto ponderado por NNyA"
          change={changeData?.value}
          changeType={changeData?.type}
          icon={Coins}
          color="terracotta"
        />
        <KpiCard
          title="En Educación"
          value={formatInversionValue(educacionTotal)}
          subtitle="Pesos — ponderado NNyA"
          icon={TrendingUp}
          color="amber"
        />
        <KpiCard
          title="En Salud"
          value={formatInversionValue(saludTotal)}
          subtitle="Pesos — ponderado NNyA"
          icon={Coins}
          color="blue"
        />
      </div>

      {/* Chart 1: Evolución del Presupuesto Ponderado (multi-line) */}
      {evolutionData.length > 1 && (
        <ChartWithTable
          title="Evolución del Presupuesto Ponderado NNyA"
          subtitle="DEVENGADO PONDERADO por área — metodología DNPPE/UNICEF. 2025 = acumulado a marzo (dato parcial)."
          color="terracotta"
          fuente="Ministerio de Finanzas Córdoba / Datos Abiertos"
          data={evolutionData.map(d => ({
            periodo: d.periodo,
            ...Object.fromEntries(
              AREA_ORDER.filter(a => a in d).map(a => [a, d[a as keyof typeof d]])
            ),
          }))}
          dataKey="Educación"
          xAxisKey="periodo"
        >
          <div className="h-80 px-4 pb-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis
                  dataKey="periodo"
                  tick={{ fill: '#4D4D4D', fontSize: 13 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#4D4D4D', fontSize: 12 }}
                  tickFormatter={formatBillionsLabel}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: 13,
                  }}
                  formatter={tooltipBillions}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                {AREA_ORDER.map(area => (
                  <Line
                    key={area}
                    type="monotone"
                    dataKey={area}
                    name={area}
                    stroke={AREA_COLORS[area]}
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartWithTable>
      )}

      {/* Chart 2: Inversión por Área (horizontal bars, filtered by year) */}
      <ChartWithTable
        title={`Inversión por Área ${activePeriod ? `(${activePeriod})` : ''}`}
        subtitle="Distribución del presupuesto ponderado NNyA por área de política pública"
        color="terracotta"
        fuente="Ministerio de Finanzas Córdoba / Datos Abiertos & Visualizador PTO"
        data={inversionArea.map(d => ({
          area: d.name,
          inversion: d.value,
        }))}
        dataKey="inversion"
        xAxisKey="area"
      >
        <div className="h-72 px-4 pb-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={inversionArea}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 110, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: '#4D4D4D', fontSize: 12 }}
                tickFormatter={formatBillionsLabel}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#4D4D4D', fontSize: 12 }}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFF',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                }}
                formatter={tooltipBillions}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {inversionArea.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={AREA_COLORS[entry.name] || COLORS.terracotta} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

      {/* Methodology note */}
      <div className="bg-[#F5F5F5] rounded-xl p-5 border border-gray-200">
        <h3 className="font-display text-sm text-[#334155] mb-2">Metodología de Ponderación</h3>
        <p className="font-body text-sm text-gray-600 leading-relaxed">
          Los valores mostrados corresponden al <strong>DEVENGADO PONDERADO</strong> calculado por
          la Dirección Nacional de Política de Presupuesto y Evaluación del Gasto (DNPPE) en
          conjunto con UNICEF. Cada partida presupuestaria se multiplica por un <em>ponderador</em>{' '}
          que estima la proporción de Niños, Niñas y Adolescentes (NNyA) entre los beneficiarios del
          programa, basado en fuentes como EPH-INDEC, registros administrativos provinciales y el
          padrón de AUH-ANSES. Fuentes:{' '}
          <em>Visualizador de Presupuesto Transparente</em> (2021-2024) y{' '}
          <em>Datos Abiertos — Ejecución Presupuestaria</em> (2025, acumulado a marzo) — Ministerio
          de Finanzas de la Provincia de Córdoba.
        </p>
      </div>
    </>
  );
}
