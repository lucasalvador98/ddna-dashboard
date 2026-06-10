'use client';

import {
  Heart,
  Baby,
  Syringe,
  TrendingDown,
  TrendingUp,
  Loader2,
  AlertCircle,
  Info,
} from 'lucide-react';
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

  // Cargar datos de Supabase — salud + salud_adolescente (nacimientos)
  useEffect(() => {
    async function fetchData() {
      try {
        const [saludRes, adolesRes] = await Promise.all([
          supabase
            .from('indicadores')
            .select('id, indicador_nombre, valor, unidad, periodo, region, desglose, fuente')
            .eq('categoria', 'salud')
            .order('periodo', { ascending: true }),
          supabase
            .from('indicadores')
            .select('id, indicador_nombre, valor, unidad, periodo, region, desglose, fuente')
            .eq('categoria', 'salud_adolescente')
            .order('periodo', { ascending: true }),
        ]);

        if (saludRes.error) {
          setError(saludRes.error.message);
          return;
        }
        if (adolesRes.error) {
          setError(adolesRes.error.message);
          return;
        }

        const allRaw = [...(saludRes.data || []), ...(adolesRes.data || [])];
        const parsed = allRaw.map(d => ({
          ...d,
          desglose: parseDesglose(d.desglose),
        })) as DashboardIndicador[];
        setData(parsed);
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
          <p className="text-sm text-gray-400 mt-1">
            Los datos de salud aún no se han cargado en la base.
          </p>
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
        const row: Record<string, unknown> = { periodo };
        for (const s of series) {
          row[s.nombre.replace('Mortalidad infantil (', '').replace(')', '')] =
            s.data.find(d => d.periodo === periodo)?.valor || null;
        }
        return row;
      })
      .sort((a, b) => Number(a.periodo) - Number(b.periodo));
  };

  // RMM Córdoba (defunciones posneonatales)
  const rmmData = getTimeSeries(INDICATOR_NAMES.TMI_RMM_CBA);
  const latestRmm = rmmData.length > 0 ? rmmData[rmmData.length - 1] : null;

  // TMNEO Córdoba (mortalidad neonatal)
  const tmneoData = getTimeSeries(INDICATOR_NAMES.TMNEO_CBA);
  const latestTmneo = tmneoData.length > 0 ? tmneoData[tmneoData.length - 1] : null;

  // TMPOS Córdoba (mortalidad post-neonatal)
  const tmposData = getTimeSeries(INDICATOR_NAMES.TMPOS_CBA);
  const latestTmpos = tmposData.length > 0 ? tmposData[tmposData.length - 1] : null;

  // Vacunación
  const dpt4Data = data.filter(
    d => d.indicador_nombre === INDICATOR_NAMES.DPT4_NACIONAL
  );
  const latestDpt4 = dpt4Data.length > 0
    ? [...dpt4Data].sort((a, b) => Number(b.periodo) - Number(a.periodo))[0]
    : null;

  const tripleViralData = data.filter(
    d => d.indicador_nombre === INDICATOR_NAMES.TRIPLE_VIRAL
  );
  const latestTripleViral = tripleViralData.length > 0
    ? [...tripleViralData].sort((a, b) => Number(b.periodo) - Number(a.periodo))[0]
    : null;

  // Últimos valores
  const latestMortalidad =
    mortalidadData.length > 0 ? mortalidadData[mortalidadData.length - 1] : null;

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
          title="RMM Córdoba"
          value={latestRmm ? `${Number(latestRmm.valor).toFixed(1)}‰` : '—'}
          subtitle={`RMM ${latestRmm?.periodo || ''} — Mortalidad posneonatal`}
          icon={Syringe}
          color="blue"
        />

        <KpiCard
          title="Nacimientos adolescentes"
          value={nacimientosValor !== null ? nacimientosValor.toLocaleString('es-AR') : '—'}
          subtitle={
            nacimientosValor !== null
              ? `Registrados en ${latestNacimientos?.periodo || ''}`
              : 'Sin datos disponibles'
          }
          icon={Heart}
          color="magenta"
        />

        <KpiCard
          title="Mortalidad Neonatal Córdoba"
          value={latestTmneo ? `${Number(latestTmneo.valor).toFixed(1)}‰` : '—'}
          subtitle={`TMNEO ${latestTmneo?.periodo || ''} — Tasa mortalidad neonatal`}
          icon={Baby}
          color="orange"
        />

        <KpiCard
          title="Mortalidad Post-Neonatal Córdoba"
          value={latestTmpos ? `${Number(latestTmpos.valor).toFixed(1)}‰` : '—'}
          subtitle={`TMPOS ${latestTmpos?.periodo || ''} — Tasa mortalidad post-neonatal`}
          icon={Syringe}
          color="amber"
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

      {/* Gráfico 2: RMM Córdoba vs Nacional */}
      {rmmData.length > 0 &&
        (() => {
          const rmmNacional = getTimeSeries(INDICATOR_NAMES.TMI_RMM);
          const rmmComparativa = () => {
            const series = [
              { nombre: 'RMM Cba', data: rmmData },
              ...(rmmNacional.length > 0 ? [{ nombre: 'RMM Nacional', data: rmmNacional }] : []),
            ];
            const periodos = [...new Set(series.flatMap(s => s.data.map(d => d.periodo)))];
            return periodos
              .map(periodo => {
                const row: Record<string, unknown> = { periodo };
                for (const s of series) {
                  row[s.nombre] = s.data.find(d => d.periodo === periodo)?.valor || null;
                }
                return row;
              })
              .sort((a, b) => Number(a.periodo) - Number(b.periodo));
          };

          return (
            <ChartWithTable
              title="Mortalidad Posneonatal (RMM)"
              subtitle="Evolución histórica - Comparación Córdoba vs Total Nacional (por cada mil nacidos vivos)"
              color="blue"
              fuente="DEIS - Dirección de Estadísticas e Información de Salud"
              data={rmmComparativa()}
              dataKey="valor"
              xAxisKey="periodo"
            >
              <div className="h-72">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart
                    data={rmmComparativa()}
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
                      dataKey="RMM Cba"
                      stroke={COLORS.blue}
                      strokeWidth={2}
                      dot={{ fill: COLORS.blue, r: 4 }}
                      name="Córdoba"
                      connectNulls
                    />
                    {rmmNacional.length > 0 && (
                      <Line
                        type="monotone"
                        dataKey="RMM Nacional"
                        stroke={COLORS.magenta}
                        strokeWidth={2}
                        dot={{ fill: COLORS.magenta, r: 4 }}
                        name="Nacional"
                        strokeDasharray="5 5"
                        connectNulls
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartWithTable>
          );
        })()}

      {/* Gráfico 3: Desglose de Mortalidad Infantil (4 indicadores) */}
      {(mortalidadData.length > 0 || rmmData.length > 0 || tmneoData.length > 0 || tmposData.length > 0) &&
        (() => {
          const series = [
            { key: 'TMI Cba', data: mortalidadData, color: COLORS.terracotta },
            { key: 'RMM Cba', data: rmmData, color: COLORS.blue },
            { key: 'TMNEO Cba', data: tmneoData, color: '#FF7F11' },
            { key: 'TMPOS Cba', data: tmposData, color: COLORS.amber },
          ].filter(s => s.data.length > 0);

          if (series.length === 0) return null;

          const periodos = [...new Set(series.flatMap(s => s.data.map(d => d.periodo)))];
          const chartData = periodos
            .map(periodo => {
              const row: Record<string, unknown> = { periodo };
              for (const s of series) {
                row[s.key] = s.data.find(d => d.periodo === periodo)?.valor ?? null;
              }
              return row;
            })
            .sort((a, b) => Number(a.periodo) - Number(b.periodo));

          return (
            <ChartWithTable
              title="Desglose de Mortalidad Infantil — Córdoba"
              subtitle="Evolución de los 4 indicadores de mortalidad infantil (por cada mil nacidos vivos)"
              color="terracotta"
              fuente="DEIS / datos.gob.ar"
              data={chartData}
              dataKey="valor"
              xAxisKey="periodo"
            >
              <div className="h-72">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart
                    data={chartData}
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
                      formatter={(value, name) => [`${Number(value ?? 0).toFixed(1)}‰`, name]}
                    />
                    <Legend />
                    {series.map(s => (
                      <Line
                        key={s.key}
                        type="monotone"
                        dataKey={s.key}
                        stroke={s.color}
                        strokeWidth={2}
                        dot={{ fill: s.color, r: 3 }}
                        name={s.key}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartWithTable>
          );
        })()}

      {/* Vacunación */}
      {latestDpt4 && (
        <div className="space-y-4">
          <SectionHeader
            icon={Syringe}
            title="Cobertura de Vacunación"
            description="Porcentaje de cobertura de vacunación en población objetivo"
            color="terracotta"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <KpiCard
              title="Cobertura DPT4 — Nacional"
              value={latestDpt4 ? `${Number(latestDpt4.valor).toFixed(1)}%` : '—'}
              subtitle={`${latestDpt4.periodo || ''} — Cobertura nacional DPT4`}
              icon={Syringe}
              color="terracotta"
            />
            {latestTripleViral && (
              <KpiCard
                title="Triple Viral (SRP) — 1ra dosis"
                value={`${Number(latestTripleViral.valor).toFixed(1)}%`}
                subtitle={`${latestTripleViral.periodo || ''} — Cobertura nacional SRP`}
                icon={Syringe}
                color="blue"
              />
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800 font-body">
              Datos provenientes de SAP (Sistema de Atención Primaria) y Ministerio de Salud de la
              Nación. Las coberturas reflejan el porcentaje de la población objetivo que recibió las
              dosis correspondientes según el Calendario Nacional de Vacunación.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
