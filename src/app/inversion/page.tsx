'use client';

/**
 * Manual Visual Verification Checklist (pipeline-inversion)
 * ======================================================
 * After deploying, manually verify these in the browser:
 *
 * 1. HOMEPAGE vs INVERSION PAGE CONSISTENCY:
 *    - Navigate to homepage and inversion page
 *    - Compare "Inversión social" (homepage) vs "Inversión en Infancia" (inversion)
 *    - Both MUST show the SAME numerical total and format, e.g. "$45,200.0 Md"
 *
 * 2. KPI VALUES > 0:
 *    - "En Educación" card SHOULD show a value > 0 (not "$—")
 *    - "En Salud" card SHOULD show a value > 0 (not "$—")
 *    - These now use includes() matching so "Educación básica..." and "Materno-infantil" match
 *
 * 3. PERIOD SELECTOR:
 *    - If data has 2023 and 2024, pill buttons should appear for both
 *    - Clicking 2023 should update all charts and KPIs to 2023 data
 *    - Default should be the latest available period
 *
 * 4. TREND CHART:
 *    - A third chart "Evolución de Inversión en Infancia" should appear
 *    - It should show bars for all available periods
 *    - Y-axis formatted in Md (millions)
 *
 * 5. CHANGE BADGE:
 *    - The "Inversión en Infancia" KPI should show a green "+X.X%" badge
 *    - Only shown when ≥ 2 periods of data exist
 *
 * 6. SCALE CORRECTION:
 *    - Values should be divided by 1,000,000 (not 1,000 as the old bug did)
 *    - Label should be "Md" not "MM"
 */

import { Coins, TrendingUp } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useDashboardData } from '@/lib/use-dashboard-data';
import {
  formatInversionValue,
  getInversionTotal,
  getInversionByCategory,
  formatInversionChange,
  isEducacionCategory,
  isSaludCategory,
} from '@/lib/format-inversion';
import { CHILD_RELEVANT_CATEGORIES } from '@/lib/inversion-constants';
import { SectionHeader } from '@/components/section-header';
import { KpiCard } from '@/components/kpi-card';
import { ChartWithTable } from '@/components/charts/chart-with-table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';
import type { Indicador } from '@/lib/use-dashboard-data';

const COLORS = {
  terracotta: '#E07A5F',
  amber: '#F3A712',
  blue: '#3777FF',
  magenta: '#BF1363',
};

// Color mapping for trend chart bars by category index
const TREND_COLORS = ['#E07A5F', '#3777FF', '#F3A712', '#BF1363', '#10B981', '#00074E', '#FF7F11'];

export default function InversionPage() {
  const { data, loading } = useDashboardData();
  const inversionData = data?.inversion || [];

  // —————————————————————————————————————————
  // Derive periods from data
  // —————————————————————————————————————————
  const periods = useMemo(() => {
    const unique = [...new Set(inversionData.map(d => d.periodo))].sort((a, b) =>
      b.localeCompare(a)
    );
    return unique;
  }, [inversionData]);

  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);

  // Default to latest period (or null if no data)
  const activePeriod = selectedPeriod ?? periods[0] ?? null;

  // —————————————————————————————————————————
  // Filter data by selected period for charts
  // —————————————————————————————————————————
  const filteredData = useMemo(() => {
    if (!activePeriod || activePeriod === 'all') return inversionData;
    return inversionData.filter(d => d.periodo === activePeriod);
  }, [inversionData, activePeriod]);

  // —————————————————————————————————————————
  // Inversión por área/categoría
  // —————————————————————————————————————————
  const inversionArea = useMemo(() => getInversionByCategory(filteredData), [filteredData]);

  // —————————————————————————————————————————
  // Inversión por organismo (top 10)
  // —————————————————————————————————————————
  const inversionOrganismo = useMemo(() => {
    const porOrganismo = new Map<string, number>();
    for (const d of filteredData) {
      const org = (d.desglose?.organismo as string) || 'Sin organismo';
      porOrganismo.set(org, (porOrganismo.get(org) || 0) + Number(d.valor));
    }
    return Array.from(porOrganismo.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredData]);

  // —————————————————————————————————————————
  // KPI values using correct category matching
  // —————————————————————————————————————————
  const total = getInversionTotal(filteredData, activePeriod ?? undefined);

  // Educación total: sum values for educación-matching categories
  const educacionTotal = useMemo(() => {
    return inversionArea
      .filter(d => isEducacionCategory(d.name))
      .reduce((sum, d) => sum + d.value, 0);
  }, [inversionArea]);

  // Salud total: sum values for salud-matching categories
  const saludTotal = useMemo(() => {
    return inversionArea
      .filter(d => isSaludCategory(d.name))
      .reduce((sum, d) => sum + d.value, 0);
  }, [inversionArea]);

  // ———————————————————————————————————————————————————
  // Change badge: compare latest two periods
  // ———————————————————————————————————————————————————
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

  // ———————————————————————————————————————————————————
  // Trend chart: multi-year aggregation
  // ———————————————————————————————————————————————————
  const trendData = useMemo(() => {
    // Group by period and sum child-relevant inversion
    return periods.map(period => {
      const totalForPeriod = getInversionTotal(inversionData, period);
      return {
        periodo: period,
        total: totalForPeriod,
      };
    });
  }, [inversionData, periods]);

  // —————————————————————————————————————————
  // Empty & error states
  // —————————————————————————————————————————
  const [error] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Coins}
        title="Indicadores de Inversión"
        description="Inversión social en infancia y adolescencia en Córdoba"
        color="terracotta"
      />

      {/* Period selector pill buttons */}
      {periods.length > 1 && (
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Selector de período">
          {periods.map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={clsx(
                'px-4 py-2 rounded-full text-sm font-accent transition-all',
                activePeriod === period
                  ? 'bg-[#00074E] text-white shadow-md'
                  : 'bg-white text-[#4D4D4D] border border-[#E0E0E0] hover:border-[#00074E] hover:text-[#00074E]'
              )}
            >
              {period}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title={`Inversión en Infancia ${activePeriod || ''}`}
          value={formatInversionValue(total)}
          subtitle="Millones de pesos — categorías vinculadas a niñez/adolescencia"
          change={changeData?.value}
          changeType={changeData?.type}
          icon={Coins}
          color="terracotta"
        />
        <KpiCard
          title="En Educación"
          value={formatInversionValue(educacionTotal)}
          subtitle="Millones de pesos"
          icon={TrendingUp}
          color="amber"
        />
        <KpiCard
          title="En Salud"
          value={formatInversionValue(saludTotal)}
          subtitle="Millones de pesos"
          icon={Coins}
          color="blue"
        />
      </div>

      {/* Trend chart: multi-year evolution */}
      {trendData.length > 1 && (
        <ChartWithTable
          title="Evolución de Inversión en Infancia"
          subtitle="Comparación interanual de inversión social en infancia"
          color="terracotta"
          fuente="Ministerio de Finanzas Córdoba"
          data={trendData.map(d => ({ periodo: d.periodo, inversion: d.total }))}
          dataKey="inversion"
          xAxisKey="periodo"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={trendData}
                margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis
                  dataKey="periodo"
                  tick={{ fill: '#4D4D4D', fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: '#4D4D4D', fontSize: 12 }}
                  tickFormatter={v => {
                    const inMillions = v / 1_000_000;
                    return `$${inMillions.toFixed(0)}Md`;
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                  }}
                  formatter={v => {
                    const val = typeof v === 'number' ? v : Number(v);
                    return [`$${(val / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Md`, 'Inversión'];
                  }}
                />
                <Bar dataKey="total" fill={COLORS.terracotta} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartWithTable>
      )}

      <ChartWithTable
        title="Inversión por Área"
        subtitle={`Distribución de inversión social por área ${activePeriod ? `(${activePeriod})` : ''}`}
        color="terracotta"
        fuente="Ministerio de Finanzas Córdoba"
        data={inversionArea.map(d => ({ area: d.name, inversion: d.value }))}
        dataKey="inversion"
        xAxisKey="area"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={inversionArea}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: '#4D4D4D', fontSize: 12 }}
                tickFormatter={v => {
                  const inMillions = v / 1_000_000;
                  return `$${inMillions.toFixed(1)}Md`;
                }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#4D4D4D', fontSize: 11 }}
                width={90}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFF',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                }}
                formatter={v => {
                  const val = typeof v === 'number' ? v : Number(v);
                  return [`$${(val / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Md`, 'Inversión'];
                }}
              />
              <Bar dataKey="value" fill={COLORS.terracotta} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

      <ChartWithTable
        title="Top 10 Organismos por Inversión"
        subtitle={`Principales organismos ejecutores de inversión social en infancia ${activePeriod ? `(${activePeriod})` : ''}`}
        color="terracotta"
        fuente="Ministerio de Finanzas Córdoba"
        data={inversionOrganismo.map(d => ({ organismo: d.name, inversion: d.value }))}
        dataKey="inversion"
        xAxisKey="organismo"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={inversionOrganismo}
              margin={{ top: 10, right: 30, left: 10, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#4D4D4D', fontSize: 10 }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fill: '#4D4D4D', fontSize: 12 }}
                tickFormatter={v => {
                  const inMillions = v / 1_000_000;
                  return `$${inMillions.toFixed(1)}Md`;
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFF',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                }}
                formatter={v => {
                  const val = typeof v === 'number' ? v : Number(v);
                  return [`$${(val / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Md`, 'Inversión'];
                }}
              />
              <Bar dataKey="value" fill={COLORS.terracotta} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

      {/* Loading state */}
      {loading && <div className="py-12 text-center text-gray-500">Cargando...</div>}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 p-4 rounded">
          <p className="text-red-700 mb-2">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-red-600 underline hover:text-red-800"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && inversionData.length === 0 && (
        <div className="bg-gray-50 p-8 rounded text-center text-gray-500">
          Sin datos disponibles
        </div>
      )}
    </div>
  );
}
