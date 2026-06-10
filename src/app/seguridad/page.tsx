'use client';

import { Shield, AlertTriangle, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { parseDesglose } from '@/lib/parse-desglose';
import { SectionHeader } from '@/components/section-header';
import { KpiCard } from '@/components/kpi-card';
import { ChartWithTable } from '@/components/charts/chart-with-table';
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
  LineChart,
  Line,
  Legend,
} from 'recharts';
import type { Indicador } from '@/lib/use-dashboard-data';
import { INDICATOR_NAMES } from '@/lib/indicator-names';

const COLORS = ['#3777FF', '#BF1363', '#F3A712', '#E07A5F', '#3599B8', '#A66999'];

// Filter for "Casos de ..." indicators directly from data (not just INDICATOR_NAMES)
const isCasosIndicator = (name: string) => name.toLowerCase().startsWith('casos de');

export default function SeguridadPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Indicador[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: indicadores, error } = await supabase
        .from('indicadores')
        .select('id, indicador_nombre, valor, unidad, periodo, region, desglose, fuente')
        .eq('categoria', 'seguridad')
        .order('periodo', { ascending: false });

      if (error) setError(error.message);
      else
        setData(
          (indicadores || []).map(d => ({
            ...d,
            desglose: parseDesglose(d.desglose),
          })) as Indicador[]
        );
      setLoading(false);
    }
    fetchData();
  }, []);

  // Distribución por tipo de denuncia
  const getDistribucion = () => {
    return data
      .filter(d => isCasosIndicator(d.indicador_nombre))
      .map(d => ({
        name: d.indicador_nombre.replace('Casos de ', ''),
        value: Number(d.valor) || 0,
      }))
      .sort((a, b) => b.value - a.value);
  };

  const distribucionData = getDistribucion();
  const total = distribucionData.reduce((sum, d) => sum + d.value, 0);

  // Latest period from data (sorted by periodo — periodo is integer from Supabase)
  const periodos = [...new Set(data.map(d => d.periodo))].sort((a, b) => {
    const aNum = typeof a === 'string' ? parseInt(a, 10) : (a as number);
    const bNum = typeof b === 'string' ? parseInt(b, 10) : (b as number);
    return bNum - aNum;
  });
  const latestPeriod = periodos[0] || '';

  // ─── Crime evolution (datos.gob.ar source) ──────────────────────
  const crimeIndicators = [
    { name: INDICATOR_NAMES.TENTATIVAS_HURTO, label: 'Tentativas de hurto', color: '#3777FF' },
    { name: INDICATOR_NAMES.TASA_TENTATIVAS_HURTO, label: 'Tasa tentativas hurto (x100K)', color: '#BF1363' },
    { name: INDICATOR_NAMES.CONTRAVENCIONES, label: 'Contravenciones', color: '#F3A712' },
    { name: INDICATOR_NAMES.ROBOS_TENTATIVA_ROBO, label: 'Robos y tentativa', color: '#E07A5F' },
  ];

  const getCrimeSeries = (nombreIndicador: string) => {
    return data
      .filter(d => d.indicador_nombre === nombreIndicador)
      .map(d => ({
        periodo: d.periodo,
        valor: Number(d.valor) || 0,
      }))
      .sort((a, b) => Number(a.periodo) - Number(b.periodo));
  };

  const crimeSeries = crimeIndicators
    .map(ind => ({ ...ind, data: getCrimeSeries(ind.name) }))
    .filter(s => s.data.length > 0);

  const crimeChartData = (() => {
    if (crimeSeries.length === 0) return [];
    const allPeriods = [...new Set(crimeSeries.flatMap(s => s.data.map(d => d.periodo)))];
    return allPeriods
      .map(periodo => {
        const row: Record<string, unknown> = { periodo };
        for (const s of crimeSeries) {
          row[s.label] = s.data.find(d => d.periodo === periodo)?.valor ?? null;
        }
        return row;
      })
      .sort((a, b) => Number(a.periodo) - Number(b.periodo));
  })();

  const crimeYearRange =
    crimeChartData.length > 0
      ? `${crimeChartData[0].periodo}–${crimeChartData[crimeChartData.length - 1].periodo}`
      : '';

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Shield}
        title="Indicadores de Seguridad"
        description="Denuncias y casos en el sistema de justicia"
        color="blue"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Total casos"
          value={total > 0 ? total.toLocaleString('es-AR') : '—'}
          subtitle={`${latestPeriod} — Casos registrados en el sistema`}
          icon={Shield}
          color="blue"
        />
        <KpiCard
          title="Violencia Familiar"
          value={
            distribucionData
              .find(d => d.name === 'Violencia Familiar')
              ?.value.toLocaleString('es-AR') || '—'
          }
          subtitle={`${latestPeriod} — Denuncias por violencia familiar`}
          icon={AlertTriangle}
          color="magenta"
        />
        <KpiCard
          title="Niñez y Adolescencia"
          value={
            distribucionData.find(d => d.name === 'Niñez')?.value.toLocaleString('es-AR') || '—'
          }
          subtitle={`${latestPeriod} — Casos de niños, niñas y adolescentes`}
          icon={Shield}
          color="orange"
        />
      </div>

      <ChartWithTable
        title="Casos por Tipo"
        subtitle="Distribución de casos en el sistema de justicia"
        color="blue"
        fuente="Ministerio Público Córdoba"
        data={distribucionData.map(d => ({ tipo: d.name, casos: d.value }))}
        dataKey="casos"
        xAxisKey="tipo"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={distribucionData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#4D4D4D', fontSize: 12 }} />
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
                formatter={v => [v?.toLocaleString('es-AR') ?? 0, 'Casos']}
              />
              <Bar dataKey="value" fill="#3777FF" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

      <ChartWithTable
        title="Distribución Porcentual"
        subtitle="Porcentaje de casos por tipo"
        color="blue"
        fuente="Ministerio Público Córdoba"
        data={distribucionData.map(d => ({
          tipo: d.name,
          porcentaje: total > 0 ? ((d.value / total) * 100).toFixed(1) : 0,
        }))}
        dataKey="porcentaje"
        xAxisKey="tipo"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={distribucionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
              >
                {distribucionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={v => [v?.toLocaleString('es-AR') ?? 0, 'Casos']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

      {/* Evolución de delitos — datos.gob.ar */}
      {crimeChartData.length > 0 && (
        <ChartWithTable
          title="Evolución de Delitos"
          subtitle={`Series históricas de delitos y contravenciones (${crimeYearRange})`}
          color="blue"
          fuente="datos.gob.ar — Sistema Nacional de Información Criminal"
          data={crimeChartData}
          dataKey="valor"
          xAxisKey="periodo"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={crimeChartData}
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis
                  dataKey="periodo"
                  tick={{ fill: '#4D4D4D', fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fill: '#4D4D4D', fontSize: 12 }} domain={[0, 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                  }}
                  formatter={(value, name) => [
                    typeof value === 'number' ? value.toLocaleString('es-AR') : value,
                    name,
                  ]}
                />
                <Legend />
                {crimeSeries.map(s => (
                  <Line
                    key={s.label}
                    type="monotone"
                    dataKey={s.label}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={false}
                    name={s.label}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartWithTable>
      )}

      {loading && <div className="py-12 text-center text-gray-500">Cargando...</div>}
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
    </div>
  );
}
