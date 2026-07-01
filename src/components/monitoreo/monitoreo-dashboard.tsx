'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { Hash, Building2, Calendar, AlertCircle, Users, Eye, FileText, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MonitoreoStats } from './monitoreo-stats';
import { CHART_COLORS_HEX, formatMonthLabel, type MonitoreoActor } from './constants';

interface DashboardData {
  totalCount: number;
  monthCount: number;
  pendientesCount: number;
  verificadosCount: number;
  ultimaSincronizacion: string | null;
  medioData: { label: string; count: number }[];
  topicoData: { label: string; count: number }[];
  monthlyData: { month: string; count: number }[];
  actorRolData: { label: string; count: number }[];
  victimaVictimarioData: { label: string; count: number }[];
  usoFuentesMedioData: {
    medio: string;
    'No usa fuentes': number;
    'Usa 1 fuente': number;
    'Usa 2 fuentes': number;
    'Usa 3 o más fuentes': number;
  }[];
  notasConEstadisticas: number;
  identificabilidadTopicoData: {
    rol: string;
    total: number;
    incorrectos: number;
    porcentaje: number;
  }[];
  topTerminosData: { label: string; count: number }[];
}

// Row type returned by the monitoreo_dashboard_stats view
interface DashboardViewRow {
  total_registros: number;
  registros_este_mes: number;
  pendientes: number;
  verificados: number;
  medio_distribution: { label: string; count: number }[] | null;
  topico_distribution: { label: string; count: number }[] | null;
  monthly_evolution: { month: string; count: number }[] | null;
  actor_rol_data: { label: string; count: number }[] | null;
  victima_victimario_data: { label: string; count: number }[] | null;
  uso_fuentes_medio_data: Record<string, unknown>[] | null;
  notas_con_estadisticas: number;
  identificabilidad_topico_data:
    | {
        rol: string;
        total: number;
        incorrectos: number;
        porcentaje: number;
      }[]
    | null;
  top_terminos_data: { label: string; count: number }[] | null;
}

// ── Recharts custom tooltip ──────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="text-slate-500 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="font-medium" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

// ── Pie chart: top 8 + "Otros" ──────────────────────────────────

function TopicoPieChart({ data }: { data: { label: string; count: number }[] }) {
  const sorted = [...data].sort((a, b) => b.count - a.count);
  const top8 = sorted.slice(0, 8);
  const otros = sorted.slice(8).reduce((sum, d) => sum + d.count, 0);

  const pieData = [
    ...top8.map(d => ({ name: d.label, value: d.count })),
    ...(otros > 0 ? [{ name: 'Otros', value: otros }] : []),
  ];

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={45}
          dataKey="value"
          nameKey="name"
          paddingAngle={2}
        >
          {pieData.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS_HEX[i % CHART_COLORS_HEX.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          wrapperStyle={{ fontSize: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Horizontal bar chart (reusable) ─────────────────────────────

function HorizontalBarChart({ data }: { data: { label: string; count: number }[] }) {
  const chartData = data
    .map((d, i) => ({
      name: d.label,
      cantidad: d.count,
      fill: CHART_COLORS_HEX[i % CHART_COLORS_HEX.length],
    }))
    .slice(0, 15)
    .reverse();

  return (
    <ResponsiveContainer width="100%" height={Math.max(240, chartData.length * 32)}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ left: 10, right: 30, top: 5, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Donut chart: Víctima vs Victimario ──────────────────────────

const VICTIMA_COLORS: Record<string, string> = {
  Ninguno: '#10B981', // green
  Victimario: '#EF4444', // red
  Víctima: '#3B82F6', // blue
};

function VictimaDonutChart({ data }: { data: { label: string; count: number }[] }) {
  const pieData = data.map(d => ({ name: d.label, value: d.count }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={50}
          dataKey="value"
          nameKey="name"
          paddingAngle={2}
        >
          {pieData.map((entry, i) => (
            <Cell
              key={i}
              fill={VICTIMA_COLORS[entry.name] ?? CHART_COLORS_HEX[i % CHART_COLORS_HEX.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          wrapperStyle={{ fontSize: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Stacked horizontal bar: Uso de Fuentes por Medio ────────────

const FUENTES_COLORS: Record<string, string> = {
  'No usa fuentes': '#9CA3AF', // gray-400
  'Usa 1 fuente': '#93C5FD', // blue-300
  'Usa 2 fuentes': '#3B82F6', // blue-500
  'Usa 3 o más fuentes': '#1E40AF', // blue-800
};

const FUENTES_KEYS = [
  'No usa fuentes',
  'Usa 1 fuente',
  'Usa 2 fuentes',
  'Usa 3 o más fuentes',
] as const;

interface FuentesMedioRow {
  medio: string;
  'No usa fuentes': number;
  'Usa 1 fuente': number;
  'Usa 2 fuentes': number;
  'Usa 3 o más fuentes': number;
}

function FuentesStackedBarChart({ data }: { data: FuentesMedioRow[] }) {
  const chartData = [...data].slice(0, 10).reverse();

  return (
    <ResponsiveContainer width="100%" height={Math.max(240, chartData.length * 40)}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ left: 10, right: 30, top: 5, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis type="category" dataKey="medio" width={130} tick={{ fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        {FUENTES_KEYS.map((key, i) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="a"
            fill={FUENTES_COLORS[key]}
            radius={i === FUENTES_KEYS.length - 1 ? [0, 4, 4, 0] : undefined}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Grouped horizontal bar: Identificabilidad por Tópico ────────

interface IdentificabilidadRow {
  rol: string;
  total: number;
  incorrectos: number;
  porcentaje: number;
}

function IdentificabilidadBarChart({ data }: { data: IdentificabilidadRow[] }) {
  const chartData = [...data].reverse();

  return (
    <ResponsiveContainer width="100%" height={Math.max(240, chartData.length * 40)}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ left: 10, right: 30, top: 5, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis type="category" dataKey="rol" width={180} tick={{ fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Bar dataKey="total" fill="#10B981" name="Total actores" radius={[0, 4, 4, 0]} />
        <Bar
          dataKey="incorrectos"
          fill="#EF4444"
          name="Identificados incorrectamente"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Area chart for monthly evolution ────────────────────────────

function MonthlyAreaChart({ data }: { data: { month: string; count: number }[] }) {
  const chartData = data.map(d => ({
    mes: formatMonthLabel(d.month),
    cantidad: d.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS_HEX[2]} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_COLORS_HEX[2]} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="cantidad"
          stroke={CHART_COLORS_HEX[2]}
          fill="url(#monthlyGradient)"
          strokeWidth={2}
          name="Registros"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD VIEW
// ═══════════════════════════════════════════════════════════════════

export function MonitoreoDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData>({
    totalCount: 0,
    monthCount: 0,
    pendientesCount: 0,
    verificadosCount: 0,
    ultimaSincronizacion: null,
    medioData: [],
    topicoData: [],
    monthlyData: [],
    actorRolData: [],
    victimaVictimarioData: [],
    usoFuentesMedioData: [],
    notasConEstadisticas: 0,
    identificabilidadTopicoData: [],
    topTerminosData: [],
  });

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Single query to the DB view — no client-side aggregation needed
      const { data: viewData, error: viewError } = await supabase
        .from('monitoreo_dashboard_stats')
        .select('*')
        .single();

      if (viewError) throw viewError;

      const row = viewData as DashboardViewRow;

      // Parse the fuentes data (view returns double-quoted column names)
      const rawFuentes = row.uso_fuentes_medio_data ?? [];
      const usoFuentesMedioData = rawFuentes.map((r: Record<string, unknown>) => ({
        medio: r.medio as string,
        'No usa fuentes': (r['"No usa fuentes"'] ?? 0) as number,
        'Usa 1 fuente': (r['"Usa 1 fuente"'] ?? 0) as number,
        'Usa 2 fuentes': (r['"Usa 2 fuentes"'] ?? 0) as number,
        'Usa 3 o más fuentes': (r['"Usa 3 o más fuentes"'] ?? 0) as number,
      }));

      setData({
        totalCount: row.total_registros ?? 0,
        monthCount: row.registros_este_mes ?? 0,
        pendientesCount: row.pendientes ?? 0,
        verificadosCount: row.verificados ?? 0,
        ultimaSincronizacion: null,
        medioData: row.medio_distribution ?? [],
        topicoData: row.topico_distribution ?? [],
        monthlyData: row.monthly_evolution ?? [],
        actorRolData: row.actor_rol_data ?? [],
        victimaVictimarioData: row.victima_victimario_data ?? [],
        usoFuentesMedioData,
        notasConEstadisticas: row.notas_con_estadisticas ?? 0,
        identificabilidadTopicoData: row.identificabilidad_topico_data ?? [],
        topTerminosData: row.top_terminos_data ?? [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-slate-600">{error}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-[var(--ddna-blue)] text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Stats */}
      <MonitoreoStats
        totalRegistros={data.totalCount}
        registrosMes={data.monthCount}
        pendientes={data.pendientesCount}
        verificados={data.verificadosCount}
        ultimaSincronizacion={data.ultimaSincronizacion}
        loading={loading}
      />

      {/* ── Row 1: Medios + Tópicos ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por medio */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[var(--ddna-blue)]" />
            Distribución por medio
          </h3>
          {data.medioData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Sin datos</p>
          ) : (
            <HorizontalBarChart data={data.medioData} />
          )}
        </div>

        {/* Distribución por tópico */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Hash className="w-4 h-4 text-[var(--ddna-blue)]" />
            Principales tópicos
          </h3>
          {data.topicoData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Sin datos</p>
          ) : (
            <TopicoPieChart data={data.topicoData} />
          )}
        </div>
      </div>

      {/* ── Section 3: Análisis de Actores ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A: Actores por Rol */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--ddna-blue)]" />
            Distribución de actores por rol
          </h3>
          {data.actorRolData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Sin datos</p>
          ) : (
            <HorizontalBarChart data={data.actorRolData} />
          )}
        </div>

        {/* Chart B: Víctima vs Victimario */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-[var(--ddna-blue)]" />
            Víctima vs Victimario
          </h3>
          {data.victimaVictimarioData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Sin datos</p>
          ) : (
            <VictimaDonutChart data={data.victimaVictimarioData} />
          )}
        </div>
      </div>

      {/* ── Section 4: Calidad Periodística — Fuentes ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chart C: Uso de fuentes por medio (stacked) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--ddna-blue)]" />
            Uso de fuentes por medio
          </h3>
          {data.usoFuentesMedioData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Sin datos</p>
          ) : (
            <FuentesStackedBarChart data={data.usoFuentesMedioData} />
          )}
        </div>

        {/* KPI Card: Notas con estadísticas */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-sm text-slate-500 mb-2">Notas con estadísticas</p>
          <p className="text-4xl font-bold text-[var(--ddna-blue)]">
            {loading ? '...' : `${data.notasConEstadisticas}%`}
          </p>
          <p className="text-xs text-slate-400 mt-2">del total de registros</p>
        </div>
      </div>

      {/* ── Section 5: Identificabilidad ────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Tag className="w-4 h-4 text-[var(--ddna-blue)]" />
          Identificabilidad incorrecta por tópico
        </h3>
        {data.identificabilidadTopicoData.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Sin datos</p>
        ) : (
          <IdentificabilidadBarChart data={data.identificabilidadTopicoData} />
        )}
      </div>

      {/* ── Section 6: Términos más Frecuentes ──────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Hash className="w-4 h-4 text-[var(--ddna-blue)]" />
          Términos más frecuentes en descripción de actores
        </h3>
        {data.topTerminosData.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Sin datos</p>
        ) : (
          <HorizontalBarChart data={data.topTerminosData} />
        )}
      </div>

      {/* Evolución mensual */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[var(--ddna-blue)]" />
          Evolución mensual (últimos 12 meses)
        </h3>
        {data.monthlyData.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Sin datos</p>
        ) : (
          <MonthlyAreaChart data={data.monthlyData} />
        )}
      </div>
    </div>
  );
}
