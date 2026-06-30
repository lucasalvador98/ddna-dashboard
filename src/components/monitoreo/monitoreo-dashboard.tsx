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
import { Hash, Building2, Calendar, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MonitoreoStats } from './monitoreo-stats';
import {
  CHART_COLORS_HEX,
  formatMonthLabel,
  getThisMonthStart,
  getMonthlyCounts,
  aggregateCounts,
  type MonitoreoRegistro,
} from './constants';

interface DashboardData {
  totalCount: number;
  monthCount: number;
  pendientesCount: number;
  verificadosCount: number;
  ultimaSincronizacion: string | null;
  medioData: { label: string; count: number }[];
  topicoData: { label: string; count: number }[];
  monthlyData: { month: string; count: number }[];
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

// ── Horizontal bar chart for medios ─────────────────────────────

function MedioBarChart({ data }: { data: { label: string; count: number }[] }) {
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
      <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
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
  });

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const monthStart = getThisMonthStart();

      // Fetch all data in parallel
      const [totalRes, monthRes, pendientesRes, verificadosRes, syncRes, allRes] = await Promise.all([
        supabase.from('monitoreo_registros').select('*', { count: 'exact', head: true }),
        supabase.from('monitoreo_registros').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
        supabase.from('monitoreo_registros').select('*', { count: 'exact', head: true }).eq('estado', 'PENDIENTE'),
        supabase.from('monitoreo_registros').select('*', { count: 'exact', head: true }).eq('estado', 'VERIFICADO'),
        supabase.from('monitoreo_registros').select('fecha_sincronizacion').order('fecha_sincronizacion', { ascending: false }).limit(1),
        supabase.from('monitoreo_registros').select('medio, topico_principal, fecha_noticia').limit(10000),
      ]);

      const registros = (allRes.data ?? []) as Pick<
        MonitoreoRegistro,
        'medio' | 'topico_principal' | 'fecha_noticia'
      >[];

      const syncData = syncRes.data?.[0] as { fecha_sincronizacion: string | null } | null;

      setData({
        totalCount: totalRes.count ?? 0,
        monthCount: monthRes.count ?? 0,
        pendientesCount: pendientesRes.count ?? 0,
        verificadosCount: verificadosRes.count ?? 0,
        ultimaSincronizacion: syncData?.fecha_sincronizacion ?? null,
        medioData: aggregateCounts(registros.map(r => r.medio)),
        topicoData: aggregateCounts(registros.map(r => r.topico_principal)),
        monthlyData: getMonthlyCounts(registros.map(r => r.fecha_noticia)),
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

      {/* Charts row: medios + tópicos */}
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
            <MedioBarChart data={data.medioData} />
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
