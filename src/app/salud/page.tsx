import { createClient } from '@supabase/supabase-js';
import { Heart, Baby, Syringe, AlertCircle, Info } from 'lucide-react';
import { parseDesglose } from '@/lib/parse-desglose';
import { INDICATOR_NAMES } from '@/lib/indicator-names';
import { SectionHeader } from '@/components/section-header';
import { EmptyState } from '@/components/empty-state';
import { KpiCard } from '@/components/kpi-card';
import { SaludCharts } from './salud-charts';
import type { SaludChartsProps } from './salud-charts';
import type { Indicador as DashboardIndicador } from '@/lib/use-dashboard-data';

const getCambio = (arr: { periodo: string; valor: number }[]) => {
  if (arr.length < 2) return null;
  const actual = arr[arr.length - 1].valor;
  const anterior = arr[arr.length - 2].valor;
  const cambio = actual - anterior;
  return {
    value: cambio.toFixed(1),
    tipo: cambio < 0 ? ('down' as const) : cambio > 0 ? ('up' as const) : ('neutral' as const),
  };
};

export default async function SaludPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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

  if (saludRes.error) throw new Error(saludRes.error.message);
  if (adolesRes.error) throw new Error(adolesRes.error.message);

  const allRaw = [...(saludRes.data || []), ...(adolesRes.data || [])];
  const data = allRaw.map((d) => ({
    ...d,
    desglose: parseDesglose(d.desglose),
  })) as DashboardIndicador[];

  if (data.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader
          icon={Heart}
          title="Indicadores de Salud"
          description="Seguimiento de indicadores de salud materno-infantil y adolescente en Córdoba"
          color="terracotta"
        />
        <EmptyState
          icon={Info}
          title="No hay datos de salud disponibles"
          description="Los datos de salud aún no se han cargado en la base."
        />
      </div>
    );
  }

  // ─── Nacimientos adolescentes ────────────────────────────────
  const nacimientosData = data
    .filter((d) => d.indicador_nombre === INDICATOR_NAMES.NACIMIENTOS_ADOLESCENTES)
    .sort((a, b) => Number(b.periodo) - Number(a.periodo));
  const latestNacimientos = nacimientosData.length > 0 ? nacimientosData[0] : null;
  const nacimientosValor = latestNacimientos?.valor ?? null;

  // ─── Time series helper ──────────────────────────────────────
  const getTimeSeries = (nombreIndicador: string) =>
    data
      .filter((d) => d.indicador_nombre === nombreIndicador)
      .map((d) => ({
        periodo: d.periodo,
        valor: Number(d.valor) || 0,
        region: d.region,
      }))
      .sort((a, b) => Number(a.periodo) - Number(b.periodo));

  // ─── Mortalidad ──────────────────────────────────────────────
  const mortalidadData = getTimeSeries(INDICATOR_NAMES.TMI_CBA);
  const rmmData = getTimeSeries(INDICATOR_NAMES.TMI_RMM_CBA);
  const tmneoData = getTimeSeries(INDICATOR_NAMES.TMNEO_CBA);
  const tmposData = getTimeSeries(INDICATOR_NAMES.TMPOS_CBA);
  const rmmNacional = getTimeSeries(INDICATOR_NAMES.TMI_RMM);

  const latestMortalidad = mortalidadData.length > 0 ? mortalidadData[mortalidadData.length - 1] : null;
  const latestRmm = rmmData.length > 0 ? rmmData[rmmData.length - 1] : null;
  const latestTmneo = tmneoData.length > 0 ? tmneoData[tmneoData.length - 1] : null;
  const latestTmpos = tmposData.length > 0 ? tmposData[tmposData.length - 1] : null;
  const cambioMortalidad = getCambio(mortalidadData);

  const mortalidadComparativaData = (() => {
    const series = [INDICATOR_NAMES.TMI_CBA, INDICATOR_NAMES.TMI_NAC]
      .map((nombre) => ({ nombre, data: getTimeSeries(nombre) }))
      .filter((s) => s.data.length > 0);
    if (series.length === 0) return [];
    const periodos = [...new Set(series.flatMap((s) => s.data.map((d) => d.periodo)))];
    return periodos
      .map((periodo) => {
        const row: Record<string, unknown> = { periodo };
        for (const s of series) {
          row[s.nombre.replace('Mortalidad infantil (', '').replace(')', '')] =
            s.data.find((d) => d.periodo === periodo)?.valor || null;
        }
        return row;
      })
      .sort((a, b) => Number(a.periodo) - Number(b.periodo));
  })();

  // ─── Vacunación ──────────────────────────────────────────────
  const getVaccinationSeries = (nombreIndicador: string) =>
    data
      .filter((d) => d.indicador_nombre === nombreIndicador)
      .map((d) => ({
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

  const esquemasIncompletos = data.find(
    (d) => d.indicador_nombre === INDICATOR_NAMES.ESQUEMAS_INCOMPLETOS
  );
  const sinDpt4 = data.find((d) => d.indicador_nombre === INDICATOR_NAMES.SIN_DPT4_REFUERZO);
  const sinSrp1 = data.find((d) => d.indicador_nombre === INDICATOR_NAMES.SIN_SRP1_HAV);
  const sinPcv13 = data.find((d) => d.indicador_nombre === INDICATOR_NAMES.SIN_PCV13);

  const dpt4Cba = data.find((d) => d.indicador_nombre === INDICATOR_NAMES.DPT4_CORDOBA);
  const srp2Cba = data.find((d) => d.indicador_nombre === INDICATOR_NAMES.SRP2_CORDOBA);
  const dptEscolarCba = data.find((d) => d.indicador_nombre === INDICATOR_NAMES.DPT_ESCOLAR_CORDOBA);

  const buildVaccinationChart = () => {
    const periodos = [
      ...new Set(
        [...dpt3Series, ...dpt4Series, ...srp1Series, ...srp2Series, ...pcv13Series].map(
          (d) => d.periodo
        )
      ),
    ].sort();
    return periodos.map((periodo) => ({
      periodo,
      DPT3: dpt3Series.find((d) => d.periodo === periodo)?.valor ?? null,
      DPT4: dpt4Series.find((d) => d.periodo === periodo)?.valor ?? null,
      'SRP 1ra dosis': srp1Series.find((d) => d.periodo === periodo)?.valor ?? null,
      'SRP 2da dosis': srp2Series.find((d) => d.periodo === periodo)?.valor ?? null,
      PCV13: pcv13Series.find((d) => d.periodo === periodo)?.valor ?? null,
    }));
  };

  const quintil1Dpt4 = data.filter((d) => d.indicador_nombre === INDICATOR_NAMES.DPT4_QUINTIL_1);
  const quintil5Dpt4 = data.filter((d) => d.indicador_nombre === INDICATOR_NAMES.DPT4_QUINTIL_5);

  const buildQuintilChart = () => {
    const periodos = [...new Set([...quintil1Dpt4, ...quintil5Dpt4].map((d) => d.periodo))].sort();
    return periodos.map((periodo) => ({
      periodo,
      'Q1 — Mayor pobreza': quintil1Dpt4.find((d) => d.periodo === periodo)?.valor ?? null,
      'Q5 — Menor pobreza': quintil5Dpt4.find((d) => d.periodo === periodo)?.valor ?? null,
    }));
  };

  const vaccinationChartData = buildVaccinationChart();
  const quintilChartData = buildQuintilChart();

  const chartProps: Omit<SaludChartsProps, 'variant'> = {
    mortalidadComparativaData,
    rmmData,
    rmmNacional,
    mortalidadData,
    tmneoData,
    tmposData,
    vaccinationChartData,
    quintilChartData,
    dpt4Cba,
    srp2Cba,
    dptEscolarCba,
    latestDpt4Valor: latestDpt4?.valor ?? null,
    latestSrp2Valor: latestSrp2?.valor ?? null,
  };

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

      {/* Charts: Mortalidad */}
      <SaludCharts variant="mortality" {...chartProps} />

      {/* Vacunación Section */}
      <div className="space-y-4">
        <SectionHeader
          icon={Syringe}
          title="Cobertura de Vacunación"
          description="Evolución histórica 2015-2024 — Calendario Nacional de Vacunación"
          color="terracotta"
          as="h2"
        />

        {/* Nomenclatura */}
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

        {/* KPIs cobertura */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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

        {/* KPIs esquemas incompletos */}
        {(esquemasIncompletos || sinDpt4 || sinSrp1 || sinPcv13) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

        {/* Charts: Vacunación */}
        <SaludCharts variant="vaccination" {...chartProps} />

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
