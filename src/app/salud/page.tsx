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
import { ChartWithTable } from '@/components/charts/chart-with-table';
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

  // ─── Vacunación: compute data ────────────────────────────────────
  const getVaccinationSeries = (nombreIndicador: string) =>
    data
      .filter(d => d.indicador_nombre === nombreIndicador)
      .map(d => ({
        periodo: d.periodo,
        valor: Number(d.valor) || 0,
        region: d.region,
      }))
      .sort((a, b) => Number(a.periodo) - Number(b.periodo));

  const dpt3Series = getVaccinationSeries(INDICATOR_NAMES.DPT3_NACIONAL);
  const dpt4Series = getVaccinationSeries(INDICATOR_NAMES.DPT4_NACIONAL);
  const srp1Series = getVaccinationSeries(INDICATOR_NAMES.SRP1_NACIONAL);
  const srp2Series = getVaccinationSeries(INDICATOR_NAMES.SRP2_NACIONAL);
  const pcv13Series = getVaccinationSeries(INDICATOR_NAMES.PCV13_NACIONAL);

  const latestDpt3 = dpt3Series[dpt3Series.length - 1] ?? null;
  const latestDpt4 = dpt4Series[dpt4Series.length - 1] ?? null;
  const latestSrp1 = srp1Series[srp1Series.length - 1] ?? null;
  const latestSrp2 = srp2Series[srp2Series.length - 1] ?? null;
  const latestPcv13 = pcv13Series[pcv13Series.length - 1] ?? null;

  // Esquemas incompletos
  const esquemasIncompletos = data.find(
    d => d.indicador_nombre === INDICATOR_NAMES.ESQUEMAS_INCOMPLETOS
  );
  const sinDpt4 = data.find(d => d.indicador_nombre === INDICATOR_NAMES.SIN_DPT4_REFUERZO);
  const sinSrp1 = data.find(d => d.indicador_nombre === INDICATOR_NAMES.SIN_SRP1_HAV);
  const sinPcv13 = data.find(d => d.indicador_nombre === INDICATOR_NAMES.SIN_PCV13);

  // Córdoba
  const dpt4Cba = data.find(d => d.indicador_nombre === INDICATOR_NAMES.DPT4_CORDOBA);
  const srp2Cba = data.find(d => d.indicador_nombre === INDICATOR_NAMES.SRP2_CORDOBA);
  const dptEscolarCba = data.find(d => d.indicador_nombre === INDICATOR_NAMES.DPT_ESCOLAR_CORDOBA);

  // Evolución histórica combinada para el gráfico principal
  const buildVaccinationChart = () => {
    const periodos = [
      ...new Set(
        [...dpt3Series, ...dpt4Series, ...srp1Series, ...srp2Series, ...pcv13Series].map(
          d => d.periodo
        )
      ),
    ].sort();

    return periodos.map(periodo => ({
      periodo,
      DPT3: dpt3Series.find(d => d.periodo === periodo)?.valor ?? null,
      DPT4: dpt4Series.find(d => d.periodo === periodo)?.valor ?? null,
      'SRP 1ra dosis': srp1Series.find(d => d.periodo === periodo)?.valor ?? null,
      'SRP 2da dosis': srp2Series.find(d => d.periodo === periodo)?.valor ?? null,
      PCV13: pcv13Series.find(d => d.periodo === periodo)?.valor ?? null,
    }));
  };

  // Quintil comparison
  const quintil1Dpt4 = data.filter(d => d.indicador_nombre === INDICATOR_NAMES.DPT4_QUINTIL_1);
  const quintil5Dpt4 = data.filter(d => d.indicador_nombre === INDICATOR_NAMES.DPT4_QUINTIL_5);

  const buildQuintilChart = () => {
    const periodos = [...new Set([...quintil1Dpt4, ...quintil5Dpt4].map(d => d.periodo))].sort();
    return periodos.map(periodo => ({
      periodo,
      'Q1 — Mayor pobreza': quintil1Dpt4.find(d => d.periodo === periodo)?.valor ?? null,
      'Q5 — Menor pobreza': quintil5Dpt4.find(d => d.periodo === periodo)?.valor ?? null,
    }));
  };

  // Últimos valores de series
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
      {(mortalidadData.length > 0 ||
        rmmData.length > 0 ||
        tmneoData.length > 0 ||
        tmposData.length > 0) &&
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
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
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

      {/* ═══════════════════════════════════════════════════════════════
          VACUNACIÓN — Evolución histórica, cobertura por vacuna,
          quintiles, Córdoba, esquemas incompletos
          ═══════════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        <SectionHeader
          icon={Syringe}
          title="Cobertura de Vacunación"
          description="Evolución histórica 2015-2024 — Calendario Nacional de Vacunación"
          color="terracotta"
        />

        {/* Nomenclatura de vacunas */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-600 font-body">
          <span>
            <strong>DPT3</strong> — 3ra dosis quíntuple (6 meses)
          </span>
          <span>
            <strong>DPT4</strong> — Refuerzo 2do año (15-18 meses)
          </span>
          <span>
            <strong>SRP 1ra</strong> — Triple viral 12 meses
          </span>
          <span>
            <strong>SRP 2da</strong> — Triple viral ingreso escolar
          </span>
          <span>
            <strong>PCV13</strong> — Neumococo conjugado (12 meses)
          </span>
        </div>

        {/* KPIs de cobertura por vacuna */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <KpiCard
            title="DPT3"
            value={latestDpt3 ? `${latestDpt3.valor}%` : '—'}
            subtitle={`3ra dosis ${latestDpt3?.periodo ?? ''}`}
            icon={Syringe}
            color="terracotta"
          />
          <KpiCard
            title="DPT4"
            value={latestDpt4 ? `${latestDpt4.valor}%` : '—'}
            subtitle={`Refuerzo ${latestDpt4?.periodo ?? ''}`}
            icon={Syringe}
            color="blue"
          />
          <KpiCard
            title="SRP 1ra dosis"
            value={latestSrp1 ? `${latestSrp1.valor}%` : '—'}
            subtitle={`${latestSrp1?.periodo ?? ''}`}
            icon={Syringe}
            color="magenta"
          />
          <KpiCard
            title="SRP 2da dosis"
            value={latestSrp2 ? `${latestSrp2.valor}%` : '—'}
            subtitle={`${latestSrp2?.periodo ?? ''}`}
            icon={Syringe}
            color="amber"
          />
          <KpiCard
            title="PCV13"
            value={latestPcv13 ? `${latestPcv13.valor}%` : '—'}
            subtitle={`Neumococo ${latestPcv13?.periodo ?? ''}`}
            icon={Syringe}
            color="orange"
          />
        </div>

        {/* Esquemas incompletos KPIs */}
        {(esquemasIncompletos || sinDpt4 || sinSrp1 || sinPcv13) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard
              title="Esquemas incompletos <1 año"
              value={
                esquemasIncompletos
                  ? `${Number(esquemasIncompletos.valor).toLocaleString('es-AR')}`
                  : '—'
              }
              subtitle="Niños con esquema incompleto"
              icon={AlertCircle}
              color="magenta"
            />
            <KpiCard
              title="Sin DPT4 refuerzo"
              value={sinDpt4 ? `${Number(sinDpt4.valor).toLocaleString('es-AR')}` : '—'}
              subtitle="15-18 meses sin refuerzo"
              icon={AlertCircle}
              color="terracotta"
            />
            <KpiCard
              title="Sin SRP1 + Hepatitis A"
              value={sinSrp1 ? `${Number(sinSrp1.valor).toLocaleString('es-AR')}` : '—'}
              subtitle="12 meses sin vacunar"
              icon={AlertCircle}
              color="blue"
            />
            <KpiCard
              title="Sin PCV13"
              value={sinPcv13 ? `${Number(sinPcv13.valor).toLocaleString('es-AR')}` : '—'}
              subtitle="Sin refuerzo neumococo"
              icon={AlertCircle}
              color="amber"
            />
          </div>
        )}

        {/* Gráfico: Evolución histórica 2015-2024 con línea de herd immunity 95% */}
        <ChartWithTable
          title="Evolución de Cobertura — Todas las Vacunas (2015-2024)"
          subtitle="Ninguna vacuna alcanzó el 95% necesario para inmunidad de rebaño en los últimos 7 años"
          color="terracotta"
          fuente="SAP/UNICEF Observatorio de la Infancia — Ministerio de Salud DiCEI"
          data={buildVaccinationChart()}
          dataKey="valor"
          xAxisKey="periodo"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={buildVaccinationChart()}
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="periodo" tick={{ fill: '#4D4D4D', fontSize: 12 }} />
                <YAxis
                  tick={{ fill: '#4D4D4D', fontSize: 12 }}
                  domain={[40, 100]}
                  tickFormatter={v => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                  }}
                  formatter={(value, name) => [value !== null ? `${value}%` : '—', name]}
                />
                <Legend />
                {/* Línea de referencia: 95% herd immunity */}
                <Line
                  type="monotone"
                  dataKey={() => 95}
                  stroke="#94A3B8"
                  strokeWidth={1.5}
                  strokeDasharray="8 4"
                  dot={false}
                  name="95% Inmunidad de rebaño"
                  legendType="line"
                />
                <Line
                  type="monotone"
                  dataKey="DPT3"
                  stroke={COLORS.terracotta}
                  strokeWidth={2.5}
                  dot={{ fill: COLORS.terracotta, r: 3 }}
                  name="DPT3 (6 meses)"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="DPT4"
                  stroke={COLORS.blue}
                  strokeWidth={2.5}
                  dot={{ fill: COLORS.blue, r: 3 }}
                  name="DPT4 (refuerzo 2do año)"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="SRP 1ra dosis"
                  stroke={COLORS.magenta}
                  strokeWidth={2}
                  dot={{ fill: COLORS.magenta, r: 3 }}
                  name="SRP 1ra dosis (12 meses)"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="SRP 2da dosis"
                  stroke={COLORS.amber}
                  strokeWidth={2}
                  dot={{ fill: COLORS.amber, r: 3 }}
                  name="SRP 2da dosis (5 años)"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="PCV13"
                  stroke="#FF7F11"
                  strokeWidth={2}
                  dot={{ fill: '#FF7F11', r: 3 }}
                  name="PCV13 Neumococo"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartWithTable>

        {/* Gráfico: Comparación por quintil socioeconómico */}
        {buildQuintilChart().length > 0 && (
          <ChartWithTable
            title="Cobertura DPT4 por Quintil Socioeconómico"
            subtitle="Paradoja: el quintil más pobre a veces supera al más rico — posible efecto complacencia"
            color="blue"
            fuente="SAP CONARPE 2023"
            data={buildQuintilChart()}
            dataKey="valor"
            xAxisKey="periodo"
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height={256}>
                <BarChart
                  data={buildQuintilChart()}
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis dataKey="periodo" tick={{ fill: '#4D4D4D', fontSize: 12 }} />
                  <YAxis
                    tick={{ fill: '#4D4D4D', fontSize: 12 }}
                    domain={[0, 100]}
                    tickFormatter={v => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFF',
                      border: '1px solid #E0E0E0',
                      borderRadius: '8px',
                    }}
                    formatter={(value, name) => [value !== null ? `${value}%` : '—', name]}
                  />
                  <Legend />
                  <Bar
                    dataKey="Q1 — Mayor pobreza"
                    fill={COLORS.terracotta}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar dataKey="Q5 — Menor pobreza" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartWithTable>
        )}

        {/* Datos Córdoba */}
        {(dpt4Cba || srp2Cba || dptEscolarCba) && (
          <ChartWithTable
            title="Cobertura Vacunación — Córdoba"
            subtitle="Jurisdicción provincial vs. nacional"
            color="magenta"
            fuente="SAP 2022"
            data={
              [
                dpt4Cba && {
                  indicador: 'DPT4 (refuerzo)',
                  Córdoba: Number(dpt4Cba.valor),
                  Nacional: latestDpt4?.valor ?? null,
                  periodo: dpt4Cba.periodo,
                },
                srp2Cba && {
                  indicador: 'SRP 2da dosis',
                  Córdoba: Number(srp2Cba.valor),
                  Nacional: latestSrp2?.valor ?? null,
                  periodo: srp2Cba.periodo,
                },
                dptEscolarCba && {
                  indicador: 'DPT escolar',
                  Córdoba: Number(dptEscolarCba.valor),
                  Nacional: null,
                  periodo: dptEscolarCba.periodo,
                },
              ].filter(Boolean) as Record<string, unknown>[]
            }
            dataKey="Córdoba"
            xAxisKey="indicador"
          >
            <div className="h-48">
              <ResponsiveContainer width="100%" height={192}>
                <BarChart
                  data={
                    [
                      dpt4Cba && {
                        indicador: 'DPT4',
                        Córdoba: Number(dpt4Cba.valor),
                        Nacional: latestDpt4?.valor ?? null,
                      },
                      srp2Cba && {
                        indicador: 'SRP2',
                        Córdoba: Number(srp2Cba.valor),
                        Nacional: latestSrp2?.valor ?? null,
                      },
                      dptEscolarCba && {
                        indicador: 'DPT Escolar',
                        Córdoba: Number(dptEscolarCba.valor),
                      },
                    ].filter(Boolean) as Record<string, unknown>[]
                  }
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis dataKey="indicador" tick={{ fill: '#4D4D4D', fontSize: 12 }} />
                  <YAxis
                    tick={{ fill: '#4D4D4D', fontSize: 12 }}
                    domain={[0, 100]}
                    tickFormatter={v => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFF',
                      border: '1px solid #E0E0E0',
                      borderRadius: '8px',
                    }}
                    formatter={(value, name) => [value !== null ? `${value}%` : '—', name]}
                  />
                  <Legend />
                  <Bar dataKey="Córdoba" fill={COLORS.magenta} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Nacional" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartWithTable>
        )}

        {/* Contexto */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800 font-body space-y-1">
            <p>
              <strong>Contexto:</strong> La pandemia COVID-19 provocó caídas de 10-20 puntos en
              coberturas durante 2020. La recuperación fue desigual: DPT4 tardó 3 años en volver a
              niveles pre-pandémicos (y en 2024 volvió a caer a 46%).
            </p>
            <p>
              <strong>Calendario Nacional:</strong> DPT3 (6 meses), DPT4 refuerzo (15-18 meses), SRP
              1ra dosis (12 meses), SRP 2da dosis (5 años ingreso escolar), PCV13 refuerzo (12
              meses).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
