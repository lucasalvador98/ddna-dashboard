'use client';

import { Heart, Baby, Syringe, TrendingDown, TrendingUp, Loader2, AlertCircle, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { parseDesglose } from '@/lib/parse-desglose';
import { INDICATOR_NAMES } from '@/lib/indicator-names';
import { SectionHeader } from '@/components/section-header';
import { KpiCard } from '@/components/kpi-card';
import {
  ChartWithTable,
  SimpleLineChart,
  SimpleBarChart,
} from '@/components/charts/chart-with-table';
import type { Indicador as DashboardIndicador } from '@/lib/use-dashboard-data';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// Colores DDNA
const COLORS = {
  terracotta: '#E07A5F',
  blue: '#3777FF',
  magenta: '#BF1363',
  amber: '#F3A712',
};

export default function SaludPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardIndicador[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos de Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        const { data: indicadores, error } = await supabase
          .from('indicadores')
          .select('id, indicador_nombre, valor, unidad, periodo, region, desglose')
          .eq('categoria', 'salud')
          .order('periodo', { ascending: true });

        if (error) {
          setError(error.message);
        } else {
        const parsed = (indicadores || []).map(d => ({
          ...d,
          desglose: parseDesglose(d.desglose),
        })) as DashboardIndicador[];
        setData(parsed);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ─── Early returns: loading / error / empty ────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          icon={Heart}
          title="Indicadores de Salud"
          description="Seguimiento de indicadores de salud materno-infantil y adolescente en Córdoba"
          color="terracotta"
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#E07A5F] animate-spin" />
          <span className="ml-3 font-body text-gray-500">Cargando datos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <SectionHeader
          icon={Heart}
          title="Indicadores de Salud"
          description="Seguimiento de indicadores de salud materno-infantil y adolescente en Córdoba"
          color="terracotta"
        />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="font-body text-gray-700 mb-2">Error al cargar los datos</p>
          <p className="text-sm text-gray-400 mb-5 max-w-md">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-[#E07A5F] text-white rounded-lg text-sm font-medium hover:bg-[#c96a4f] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader
          icon={Heart}
          title="Indicadores de Salud"
          description="Seguimiento de indicadores de salud materno-infantil y adolescente en Córdoba"
          color="terracotta"
        />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Info className="w-12 h-12 text-gray-300 mb-4" />
          <p className="font-body text-gray-600">No hay datos de salud disponibles</p>
          <p className="text-sm text-gray-400 mt-1">Los datos de salud aún no se han cargado en la base.</p>
        </div>
      </div>
    );
  }

  // ─── Compute derived data ──────────────────────────────────────

  // Nacimientos adolescentes
  const nacimientosData = data
    .filter(d => d.indicador_nombre === INDICATOR_NAMES.NACIMIENTOS_ADOLESCENTES)
    .sort((a, b) => Number(b.periodo) - Number(a.periodo));

  const latestNacimientos = nacimientosData.length > 0 ? nacimientosData[0] : null;
  const nacimientosValor = latestNacimientos?.valor ?? null;

  // Agrupar datos por indicador para time series
  const getTimeSeries = (nombreIndicador: string) => {
    return data
      .filter(d => d.indicador_nombre === nombreIndicador)
      .map(d => ({
        periodo: d.periodo,
        valor: Number(d.valor) || 0,
        region: d.region,
      }))
      .sort((a, b) => Number(a.periodo) - Number(b.periodo));
  };

  // Mortalidad infantil time series (TMI Córdoba - métrica principal)
  const mortalidadData = getTimeSeries(INDICATOR_NAMES.TMI_CBA);

  // Otras series para gráfico comparativo
  const mortalidadComparativa = () => {
    const series = [INDICATOR_NAMES.TMI_CBA, INDICATOR_NAMES.TMI_NAC]
      .map(nombre => ({
        nombre,
        data: getTimeSeries(nombre),
      }))
      .filter(s => s.data.length > 0);

    if (series.length === 0) return [];

    // Combinar por periodo
    const periodos = [...new Set(series.flatMap(s => s.data.map(d => d.periodo)))];
    return periodos
      .map(periodo => {
        const row: Record<string, any> = { periodo };
        for (const s of series) {
          row[s.nombre.replace('Mortalidad infantil (', '').replace(')', '')] =
            s.data.find(d => d.periodo === periodo)?.valor || null;
        }
        return row;
      })
      .sort((a, b) => Number(a.periodo) - Number(b.periodo));
  };

  // Cobertura vacunal
  // NOTE: 'cobertura' fuzzy match — may return 0 rows if the exact DB name differs.
  // TODO: investigate exact DB name for cobertura and use canonical constant
  const coberturaData = data
    .filter(d => d.indicador_nombre.toLowerCase().includes('cobertura'))
    .map(d => ({
      name: d.desglose?.vacuna || d.desglose?.tipo || 'General',
      value: Number(d.valor) || 0,
    }));
  
  const coberturaPeriod = data
    .find(d => d.indicador_nombre.toLowerCase().includes('cobertura'))?.periodo;

  // Últimos valores
  const latestMortalidad =
    mortalidadData.length > 0 ? mortalidadData[mortalidadData.length - 1] : null;

  const latestCobertura = coberturaData.length > 0 ? coberturaData[coberturaData.length - 1] : null;

  // Calcular cambio
  const getCambio = (arr: { periodo: string; valor: number }[]) => {
    if (arr.length < 2) return null;
    const actual = arr[arr.length - 1].valor;
    const anterior = arr[arr.length - 2].valor;
    const cambio = actual - anterior;
    return {
      value: cambio.toFixed(1),
      tipo: cambio < 0 ? 'down' : cambio > 0 ? 'up' : 'neutral',
    };
  };

  const cambioMortalidad = getCambio(mortalidadData);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Heart}
        title="Indicadores de Salud"
        description="Seguimiento de indicadores de salud materno-infantil y adolescente en Córdoba"
        color="terracotta"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Mortalidad infantil Córdoba"
          value={latestMortalidad ? `${Number(latestMortalidad.valor).toFixed(1)}‰` : '—'}
          subtitle={`TMI - Córdoba ${latestMortalidad?.periodo || ''}`}
          change={cambioMortalidad ? `${cambioMortalidad.value}‰` : undefined}
          changeType={cambioMortalidad?.tipo as 'up' | 'down' | undefined}
          icon={Baby}
          color="terracotta"
        />

        <KpiCard
          title="Cobertura vacunal"
          value={latestCobertura ? `${latestCobertura.value}%` : '—'}
          subtitle={`${coberturaPeriod || ''} — Promedio de esquemas completos`}
          icon={Syringe}
          color="blue"
        />

        <KpiCard
          title="Nacimientos adolescentes"
          value={nacimientosValor !== null ? nacimientosValor.toLocaleString('es-AR') : '—'}
          subtitle={nacimientosValor !== null ? `Registrados en ${latestNacimientos?.periodo || ''}` : 'Sin datos disponibles'}
          icon={Heart}
          color="magenta"
        />
      </div>

      {/* Gráfico 1: Mortalidad Infantil */}
      <ChartWithTable
        title="Tasa de Mortalidad Infantil"
        subtitle="Evolución histórica - Comparación Córdoba vs Total Nacional (por cada mil nacidos vivos)"
        color="terracotta"
        fuente="DEIS - Dirección de Estadísticas e Información de Salud"
        data={mortalidadComparativa()}
        dataKey="valor"
        xAxisKey="periodo"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={mortalidadComparativa()}
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="periodo" tick={{ fill: '#4D4D4D', fontSize: 12 }} />
              <YAxis
                tick={{ fill: '#4D4D4D', fontSize: 12 }}
                domain={[0, 'auto']}
                tickFormatter={v => `${Number(v).toFixed(1)}‰`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFF',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                }}
                formatter={(value, name) => [`${value ?? 0}‰`, name]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="TMI Cba"
                stroke={COLORS.terracotta}
                strokeWidth={2}
                dot={{ fill: COLORS.terracotta, r: 4 }}
                name="Córdoba"
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="TMI"
                stroke={COLORS.blue}
                strokeWidth={2}
                dot={{ fill: COLORS.blue, r: 4 }}
                name="Nacional"
                strokeDasharray="5 5"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

      {/* Gráfico 2: Cobertura Vacunal */}
      <ChartWithTable
        title="Cobertura Vacunal por Tipo"
        subtitle="Porcentaje de esquemas completos por vacuna"
        color="blue"
        fuente="DEIS"
        data={coberturaData}
        dataKey="value"
        xAxisKey="name"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={coberturaData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: '#4D4D4D', fontSize: 12 }}
                tickFormatter={v => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#4D4D4D', fontSize: 11 }}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFF',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                }}
                formatter={value => [`${value ?? 0}%`, 'Cobertura']}
              />
              <Bar dataKey="value" fill={COLORS.blue} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

    </div>
  );
}
