'use client';

import { Coins, TrendingUp, Filter, Info, BarChart3, PieChart } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useDashboardData } from '@/lib/use-dashboard-data';
import {
  formatInversionValue,
  getInversionTotal,
  isEducacionCategory,
  isSaludCategory,
  formatInversionChange,
} from '@/lib/format-inversion';
import { SectionHeader } from '@/components/section-header';
import { KpiCard } from '@/components/kpi-card';
import { ChartWithTable } from '@/components/charts/chart-with-table';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  PieChart as RechartsPie,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import clsx from 'clsx';

// ─── Color Palette ─────────────────────────────────────────────────────────────

const COLORS = {
  terracotta: '#E07A5F',
  amber: '#F3A712',
  blue: '#3777FF',
  magenta: '#BF1363',
  green: '#10B981',
  navy: '#1a2556',
};

const AREA_COLORS: Record<string, string> = {
  Educación: COLORS.blue,
  Salud: COLORS.terracotta,
  'Desarrollo Social': COLORS.amber,
  'Niñez y Adolescencia': COLORS.magenta,
  Otros: COLORS.green,
};

const AREA_ORDER = ['Educación', 'Salud', 'Desarrollo Social', 'Niñez y Adolescencia', 'Otros'];

// ─── Helpers ───────────────────────────────────────────────────────────────────

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
    const b = val / 1_000_000_000_000;
    return [
      `$${b.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} billones`,
      '',
    ];
  }
  if (val >= 1_000_000_000) {
    const bb = val / 1_000_000_000;
    return [
      `$${bb.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} mil millones`,
      '',
    ];
  }
  if (val >= 1_000_000) {
    const m = val / 1_000_000;
    return [
      `$${m.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} millones`,
      '',
    ];
  }
  return [`$${val.toLocaleString('en-US')}`, ''];
}

// ─── Types ─────────────────────────────────────────────────────────────────────

type ViewMode = 'area' | 'programa' | 'comparativa';
type FilterArea =
  | 'all'
  | 'Educación'
  | 'Salud'
  | 'Desarrollo Social'
  | 'Niñez y Adolescencia'
  | 'Otros';

// ─── Page Component ────────────────────────────────────────────────────────────

export default function PresupuestoNnyaPage() {
  const { data, loading } = useDashboardData();
  const inversionData = data?.inversion || [];

  // ── State ──────────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>('area');
  const [filterArea, setFilterArea] = useState<FilterArea>('all');
  const [showMethodology, setShowMethodology] = useState(false);

  // ── Derive periods ──────────────────────────────────────────────────────────

  const periods = useMemo(() => {
    const unique = [...new Set(inversionData.map(d => d.periodo))].sort((a, b) => {
      const aNum = typeof a === 'string' ? parseInt(a, 10) : (a as number);
      const bNum = typeof b === 'string' ? parseInt(b, 10) : (b as number);
      return bNum - aNum;
    });
    return unique;
  }, [inversionData]);

  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const activePeriod = selectedPeriod ?? periods[0] ?? null;

  // ── Filter data ────────────────────────────────────────────────────────────

  const filteredData = useMemo(() => {
    let result = inversionData;

    // Filter by period
    if (activePeriod && activePeriod !== 'all') {
      result = result.filter(d => d.periodo === activePeriod);
    }

    // Filter by area
    if (filterArea !== 'all') {
      result = result.filter(d => {
        const area = d.desglose?.area as string;
        return area === filterArea;
      });
    }

    return result;
  }, [inversionData, activePeriod, filterArea]);

  // ── Aggregation by area ─────────────────────────────────────────────────────

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

  // ── Aggregation by program ──────────────────────────────────────────────────

  const inversionPrograma = useMemo(() => {
    const porPrograma = new Map<string, { value: number; ponderador: number; area: string }>();
    for (const d of filteredData) {
      const programa = (d.desglose?.programa as string) || 'Sin programa';
      const area = (d.desglose?.area as string) || 'Otros';
      const ponderador = Number(d.desglose?.ponderador_promedio) || 0;
      const existing = porPrograma.get(programa);
      if (existing) {
        existing.value += Number(d.valor);
      } else {
        porPrograma.set(programa, { value: Number(d.valor), ponderador, area });
      }
    }
    return Array.from(porPrograma.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);
  }, [filteredData]);

  // ── KPI values ──────────────────────────────────────────────────────────────

  const total = getInversionTotal(filteredData, activePeriod ?? undefined);

  const educacionTotal = useMemo(() => {
    return inversionArea
      .filter(d => isEducacionCategory(d.name))
      .reduce((sum, d) => sum + d.value, 0);
  }, [inversionArea]);

  const saludTotal = useMemo(() => {
    return inversionArea.filter(d => isSaludCategory(d.name)).reduce((sum, d) => sum + d.value, 0);
  }, [inversionArea]);

  // ── Change badge ────────────────────────────────────────────────────────────

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

  // ── Evolution data (all periods) ────────────────────────────────────────────

  const evolutionData = useMemo(() => {
    if (periods.length === 0) return [];

    const periodMap = new Map<string, Record<string, number>>();

    for (const p of periods) {
      periodMap.set(p, {
        Educación: 0,
        Salud: 0,
        'Desarrollo Social': 0,
        'Niñez y Adolescencia': 0,
        Otros: 0,
      });
    }

    for (const d of inversionData) {
      const p = d.periodo;
      const area = (d.desglose?.area as string) || 'Otros';
      const entry = periodMap.get(p);
      if (entry && area in entry) {
        entry[area] += Number(d.valor || 0);
      }
    }

    return periods
      .map(periodo => ({
        periodo,
        ...(periodMap.get(periodo) || {}),
      }))
      .reverse();
  }, [inversionData, periods]);

  // ── Pie chart data ──────────────────────────────────────────────────────────

  const pieData = useMemo(() => {
    return inversionArea.map(d => ({
      name: d.name,
      value: d.value,
      fill: AREA_COLORS[d.name] || COLORS.terracotta,
    }));
  }, [inversionArea]);

  // ── Empty / error states ────────────────────────────────────────────────────

  const [error] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Coins}
        title="Presupuesto NNyA Interactivo"
        description="Inversión provincial en infancia y adolescencia con metodología DNPPE/UNICEF"
        color="terracotta"
      />

      {/* Methodology Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowMethodology(!showMethodology)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-accent text-[#1a2556] bg-[#F5F5F5] rounded-lg hover:bg-[#E0E0E0] transition-colors"
        >
          <Info className="w-4 h-4" />
          {showMethodology ? 'Ocultar Metodología' : 'Ver Metodología'}
        </button>
      </div>

      {/* Methodology Panel */}
      {showMethodology && (
        <div className="bg-[#F5F5F5] rounded-xl p-6 border border-gray-200">
          <h3 className="font-display text-lg text-[#1a2556] mb-4">Metodología de Ponderación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-accent text-sm font-semibold text-[#1a2556] mb-2">
                ¿Qué es el ponderador?
              </h4>
              <p className="font-body text-sm text-gray-600 leading-relaxed">
                El <strong>ponderador NNyA</strong> representa el porcentaje de cada gasto
                presupuestario que beneficia directamente a Niños, Niñas y Adolescentes (0-17 años).
                Se calcula según la metodología DNPPE/UNICEF.
              </p>
            </div>
            <div>
              <h4 className="font-accent text-sm font-semibold text-[#1a2556] mb-2">
                Categorías de gasto
              </h4>
              <ul className="font-body text-sm text-gray-600 space-y-1">
                <li>
                  <strong>A (100%):</strong> Educación, jardines infantes
                </li>
                <li>
                  <strong>C (variable):</strong> Salud, transferencias, servicios
                </li>
                <li>
                  <strong>D (población):</strong> Infraestructura general
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
            <p className="font-body text-xs text-gray-500">
              <strong>Fórmula:</strong> Devengado Ponderado = Devengado Crudo × Ponderador NNyA
            </p>
          </div>
        </div>
      )}

      {/* View Mode Selector */}
      <div className="flex gap-2 flex-wrap" role="group" aria-label="Modo de vista">
        <button
          onClick={() => setViewMode('area')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-accent transition-all',
            viewMode === 'area'
              ? 'bg-[#1a2556] text-white shadow-md'
              : 'bg-white text-[#4D4D4D] border border-[#E0E0E0] hover:border-[#1a2556] hover:text-[#1a2556]'
          )}
        >
          <PieChart className="w-4 h-4" />
          Por Área
        </button>
        <button
          onClick={() => setViewMode('programa')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-accent transition-all',
            viewMode === 'programa'
              ? 'bg-[#1a2556] text-white shadow-md'
              : 'bg-white text-[#4D4D4D] border border-[#E0E0E0] hover:border-[#1a2556] hover:text-[#1a2556]'
          )}
        >
          <BarChart3 className="w-4 h-4" />
          Por Programa
        </button>
        <button
          onClick={() => setViewMode('comparativa')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-accent transition-all',
            viewMode === 'comparativa'
              ? 'bg-[#1a2556] text-white shadow-md'
              : 'bg-white text-[#4D4D4D] border border-[#E0E0E0] hover:border-[#1a2556] hover:text-[#1a2556]'
          )}
        >
          <TrendingUp className="w-4 h-4" />
          Comparativa
        </button>
      </div>

      {/* Filter by Area */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-accent text-gray-600">Filtrar por área:</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterArea('all')}
            className={clsx(
              'px-3 py-1 rounded-full text-xs font-accent transition-all',
              filterArea === 'all'
                ? 'bg-[#1a2556] text-white'
                : 'bg-white text-[#4D4D4D] border border-[#E0E0E0] hover:border-[#1a2556]'
            )}
          >
            Todas
          </button>
          {AREA_ORDER.map(area => (
            <button
              key={area}
              onClick={() => setFilterArea(area as FilterArea)}
              className={clsx(
                'px-3 py-1 rounded-full text-xs font-accent transition-all',
                filterArea === area
                  ? 'bg-[#1a2556] text-white'
                  : 'bg-white text-[#4D4D4D] border border-[#E0E0E0] hover:border-[#1a2556]'
              )}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Period selector */}
      {periods.length > 1 && (
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Selector de período">
          {periods.map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={clsx(
                'px-4 py-2 rounded-full text-sm font-accent transition-all',
                activePeriod === period
                  ? 'bg-[#1a2556] text-white shadow-md'
                  : 'bg-white text-[#4D4D4D] border border-[#E0E0E0] hover:border-[#1a2556] hover:text-[#1a2556]'
              )}
            >
              {period}
            </button>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title={`Inversión NNyA ${activePeriod || ''}`}
          value={formatInversionValue(total)}
          subtitle="Presupuesto ponderado por NNyA"
          change={changeData?.value}
          changeType={changeData?.type}
          icon={Coins}
          color="terracotta"
        />
        <KpiCard
          title="En Educación"
          value={formatInversionValue(educacionTotal)}
          subtitle="100% considerado NNyA"
          icon={TrendingUp}
          color="amber"
        />
        <KpiCard
          title="En Salud"
          value={formatInversionValue(saludTotal)}
          subtitle="~40% ponderado NNyA"
          icon={Coins}
          color="blue"
        />
      </div>

      {/* View: Area */}
      {viewMode === 'area' && (
        <>
          {/* Pie Chart */}
          <ChartWithTable
            title="Distribución por Área de Política Pública"
            subtitle="Presupuesto ponderado NNyA por sector"
            color="terracotta"
            fuente="Ministerio de Finanzas Córdoba / Visualizador PTO"
            data={inversionArea.map(d => ({
              area: d.name,
              inversion: d.value,
            }))}
            dataKey="inversion"
            xAxisKey="area"
          >
            <div className="h-80 px-4 pb-2">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={tooltipBillions} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </ChartWithTable>

          {/* Bar Chart by Area */}
          <ChartWithTable
            title="Inversión por Área"
            subtitle="Comparativa de presupuesto ponderado NNyA"
            color="terracotta"
            fuente="Ministerio de Finanzas Córdoba / Visualizador PTO"
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
                      <Cell
                        key={`cell-${index}`}
                        fill={AREA_COLORS[entry.name] || COLORS.terracotta}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartWithTable>
        </>
      )}

      {/* View: Programa */}
      {viewMode === 'programa' && (
        <ChartWithTable
          title={`Top 15 Programas ${filterArea !== 'all' ? `- ${filterArea}` : ''}`}
          subtitle="Presupuesto ponderado NNyA por programa"
          color="terracotta"
          fuente="Ministerio de Finanzas Córdoba / Visualizador PTO"
          data={inversionPrograma.map(d => ({
            programa: d.name.length > 40 ? d.name.substring(0, 40) + '...' : d.name,
            inversion: d.value,
            ponderador: d.ponderador,
          }))}
          dataKey="inversion"
          xAxisKey="programa"
        >
          <div className="h-96 px-4 pb-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={inversionPrograma}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 200, bottom: 10 }}
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
                  tick={{ fill: '#4D4D4D', fontSize: 10 }}
                  width={190}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {inversionPrograma.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={AREA_COLORS[entry.area] || COLORS.terracotta}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartWithTable>
      )}

      {/* View: Comparativa */}
      {viewMode === 'comparativa' && evolutionData.length > 1 && (
        <ChartWithTable
          title="Evolución del Presupuesto Ponderado NNyA"
          subtitle="DEVENGADO PONDERADO por área — metodología DNPPE/UNICEF"
          color="terracotta"
          fuente="Ministerio de Finanzas Córdoba / Visualizador PTO"
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

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
        <h3 className="font-display text-lg text-[#1a2556] mb-4">Detalle por Programa</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-accent text-[#1a2556]">Programa</th>
                <th className="text-left py-3 px-4 font-accent text-[#1a2556]">Área</th>
                <th className="text-right py-3 px-4 font-accent text-[#1a2556]">Ponderador</th>
                <th className="text-right py-3 px-4 font-accent text-[#1a2556]">
                  Devengado Ponderado
                </th>
              </tr>
            </thead>
            <tbody>
              {inversionPrograma.map((prog, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-body text-[#4D4D4D]">{prog.name}</td>
                  <td className="py-3 px-4">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-accent"
                      style={{
                        backgroundColor: `${AREA_COLORS[prog.area]}20`,
                        color: AREA_COLORS[prog.area],
                      }}
                    >
                      {prog.area}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-body text-[#4D4D4D]">
                    {(prog.ponderador * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-right font-body font-medium text-[#1a2556]">
                    {formatInversionValue(prog.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-12 text-center text-gray-500">Cargando datos de inversión...</div>
      )}

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
