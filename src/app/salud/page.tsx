import { createClient } from '@supabase/supabase-js';
import { Heart, Syringe, AlertCircle, Info, Baby } from 'lucide-react';
import { parseDesglose } from '@/lib/parse-desglose';
import { INDICATOR_NAMES } from '@/lib/indicator-names';
import { SectionHeader } from '@/components/section-header';
import { EmptyState } from '@/components/empty-state';
import { KpiCard } from '@/components/kpi-card';
import { SaludCharts } from './salud-charts';
import type { SaludChartsProps } from './salud-charts';
import { SaludInteractive, NatalidadFecundidad } from './salud-interactive';
import type { Indicador as DashboardIndicador } from '@/lib/use-dashboard-data';
import { hasPublicSupabaseConfig } from '@/lib/runtime-config';
import { SupabaseUnavailable } from '@/components/supabase-unavailable';

// ─── Natalidad y fecundidad ──────────────────────────────────────
// Estas series viven en `categoria = 'salud'`, pero NO se pueden leer del fetch
// general: esa categoría tiene ~8.270 filas y PostgREST corta en 1.000 por
// request, así que el fetch sin `.range()` dejaba la natalidad recortada a 8 de
// sus 25 años y ninguna fila de fecundidad por edad. Se piden aparte, filtradas
// por nombre y paginadas.
// La serie oficial `Tasa fecundidad adolescente` vive en `salud_adolescente` y
// ya viene completa en `data` (esa categoría tiene 32 filas).
const NATALIDAD_CORDOBA = 'Tasa de natalidad (Córdoba)';
const NATALIDAD_NACIONAL = 'Tasa de natalidad (Nacional)';
const FECUNDIDAD_EDAD_PREFIX = 'Tasa de fecundidad — ';
const FECUNDIDAD_GRUPOS = [
  'Menor de 15',
  '15 a 19',
  '20 a 24',
  '25 a 29',
  '30 a 34',
  '35 a 39',
  '40 a 44',
  'De 45 y más',
] as const;

/** Orden canónico de los grupos de edad (de menor a mayor) para las barras. */
const RANK_FECUNDIDAD = new Map<string, number>(
  FECUNDIDAD_GRUPOS.map((grupo, index): [string, number] => [grupo, index])
);

const NOMBRES_NATALIDAD_FECUNDIDAD: readonly string[] = [
  NATALIDAD_CORDOBA,
  NATALIDAD_NACIONAL,
  ...FECUNDIDAD_GRUPOS.map((grupo) => `${FECUNDIDAD_EDAD_PREFIX}${grupo}`),
];

const PAGE_SIZE = 1000;

/** Fila cruda de `indicadores` tal como la devuelve el select de la pantalla. */
type RawIndicadorRow = {
  id: number | string;
  indicador_nombre: string | null;
  valor: number | null;
  unidad: string | null;
  periodo: string | number | null;
  region: string | null;
  desglose: unknown;
  fuente: string | null;
};

type NatalidadFecundidadRow = {
  indicador_nombre: string | null;
  valor: number | null;
  unidad: string | null;
  periodo: string | number | null;
  region: string | null;
  fuente: string | null;
};

export default async function SaludPage() {
  if (!hasPublicSupabaseConfig()) {
    return <SupabaseUnavailable />;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Paginado propio para las series de natalidad y fecundidad por edad: el
  // filtro por nombre deja 58 filas (1 página), pero se sigue paginando hasta
  // recibir una página incompleta para que agregar años no las corte en silencio.
  const fetchNatalidadFecundidad = async (): Promise<NatalidadFecundidadRow[]> => {
    const rows: NatalidadFecundidadRow[] = [];
    for (let offset = 0; ; offset += PAGE_SIZE) {
      const { data: page, error } = await supabase
        .from('indicadores')
        .select('indicador_nombre, valor, unidad, periodo, region, fuente')
        .eq('categoria', 'salud')
        .in('indicador_nombre', NOMBRES_NATALIDAD_FECUNDIDAD)
        .order('periodo', { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) throw new Error(error.message);

      const filas = (page ?? []) as NatalidadFecundidadRow[];
      rows.push(...filas);

      if (filas.length < PAGE_SIZE) break;
    }
    return rows;
  };

  // ⚠️ Paginado obligatorio: `categoria = 'salud'` tiene ~8.270 filas y PostgREST
  // corta en 1.000 por request. Sin `.range()`, la pantalla recibía sólo las 1.000
  // de período más viejo (ordena ascendente), así que TODO lo reciente quedaba
  // afuera: la vacunación 2024-2025 entera y buena parte de mortalidad y
  // nacimientos. El desempate por `id` no es decorativo: ordenar sólo por
  // `periodo` deja el orden indefinido entre filas del mismo período, y entre
  // páginas eso duplica o pierde filas.
  const fetchCategoria = async (categoria: string): Promise<RawIndicadorRow[]> => {
    const rows: RawIndicadorRow[] = [];
    for (let offset = 0; ; offset += PAGE_SIZE) {
      const { data: page, error } = await supabase
        .from('indicadores')
        .select('id, indicador_nombre, valor, unidad, periodo, region, desglose, fuente')
        .eq('categoria', categoria)
        .order('periodo', { ascending: true })
        .order('id', { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) throw new Error(error.message);

      const filas = (page ?? []) as unknown as RawIndicadorRow[];
      rows.push(...filas);

      if (filas.length < PAGE_SIZE) break;
    }
    return rows;
  };

  const [saludRows, adolesRows, natalidadFecundidadRows] = await Promise.all([
    fetchCategoria('salud'),
    fetchCategoria('salud_adolescente'),
    fetchNatalidadFecundidad(),
  ]);

  const allRaw = [...saludRows, ...adolesRows];
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
    .map((d) => ({ periodo: String(d.periodo), valor: Number(d.valor) || 0 }))
    .sort((a, b) => Number(a.periodo) - Number(b.periodo));

  // ─── Time series helper ──────────────────────────────────────
  const getTimeSeries = (nombreIndicador: string) =>
    data
      .filter((d) => d.indicador_nombre === nombreIndicador)
      .map((d) => ({
        // periodo llega como number desde la DB (ej: 2015); normalizo a string
        // para que el cross-filtering compare consistentemente (selectedYear).
        periodo: String(d.periodo),
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
        periodo: String(d.periodo),
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

  // ─── Natalidad (‰, 2000-2024, Córdoba vs Nación) ──────────────
  const natalidadRows = natalidadFecundidadRows.filter(
    (row) => row.indicador_nombre === NATALIDAD_CORDOBA || row.indicador_nombre === NATALIDAD_NACIONAL
  );

  const valorNatalidad = (nombre: string, periodo: string): number | null => {
    const row = natalidadRows.find(
      (r) => r.indicador_nombre === nombre && String(r.periodo) === periodo
    );
    return row && row.valor !== null ? Number(row.valor) : null;
  };

  // La grilla sale de la unión de años de las dos series: si una fuente se atrasa,
  // el año se grafica igual con el otro valor y la línea puentea el hueco.
  const natalidadChartData: Record<string, unknown>[] = [
    ...new Set(natalidadRows.map((row) => String(row.periodo))),
  ]
    .sort((a, b) => Number(a) - Number(b))
    .map((periodo) => ({
      periodo,
      'Córdoba': valorNatalidad(NATALIDAD_CORDOBA, periodo),
      'Nacional': valorNatalidad(NATALIDAD_NACIONAL, periodo),
    }));

  // ─── Fecundidad por edad de la madre (‰, Córdoba) ─────────────
  const fecundidadPorEdadRows = natalidadFecundidadRows.filter(
    (row) =>
      String(row.indicador_nombre ?? '').startsWith(FECUNDIDAD_EDAD_PREFIX) &&
      row.region === 'Córdoba'
  );

  // La serie es de un solo año (2022): se grafica el último cargado y no se
  // mezclan años distintos en las mismas barras.
  const periodosFecundidad = fecundidadPorEdadRows
    .map((row) => Number(row.periodo))
    .filter((periodo) => Number.isFinite(periodo));
  const fecundidadAnio =
    periodosFecundidad.length > 0 ? String(Math.max(...periodosFecundidad)) : null;

  // Map por grupo: una fila repetida (o un año viejo) no infla las barras.
  const fecundidadPorGrupo = new Map<string, number>();
  for (const row of fecundidadPorEdadRows) {
    if (fecundidadAnio === null || String(row.periodo) !== fecundidadAnio) continue;
    fecundidadPorGrupo.set(
      String(row.indicador_nombre ?? '').slice(FECUNDIDAD_EDAD_PREFIX.length),
      Number(row.valor)
    );
  }

  // Barras de menor a mayor edad: manda el orden canónico del grupo; un grupo
  // que no esté en esa lista va al final (no se descarta) ordenado por nombre.
  const fecundidadEdadData = [...fecundidadPorGrupo.entries()]
    .map(([grupo, tasa]) => ({ grupo, tasa }))
    .sort(
      (a, b) =>
        (RANK_FECUNDIDAD.get(a.grupo) ?? FECUNDIDAD_GRUPOS.length) -
          (RANK_FECUNDIDAD.get(b.grupo) ?? FECUNDIDAD_GRUPOS.length) ||
        a.grupo.localeCompare(b.grupo, 'es')
    );

  // Serie oficial del DEIS: es la única comparable (misma convención de
  // denominador) y la nota metodológica la usa como referencia del mismo año.
  const fecundidadOficialData = data
    .filter((d) => d.indicador_nombre === INDICATOR_NAMES.TASA_FECUNDIDAD_ADOLESCENTE)
    .map((d) => ({ periodo: String(d.periodo), valor: Number(d.valor) }))
    .sort((a, b) => Number(a.periodo) - Number(b.periodo));

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

      {/* KPI Cards + Mortality charts — cross-filtering */}
      <SaludInteractive
        mortalidadData={mortalidadData}
        rmmData={rmmData}
        tmneoData={tmneoData}
        tmposData={tmposData}
        nacimientosData={nacimientosData}
        chartProps={chartProps}
      />

      {/* Natalidad y fecundidad Section */}
      <div className="space-y-4">
        <SectionHeader
          icon={Baby}
          title="Natalidad y fecundidad"
          description="Tasa de natalidad en Córdoba y Nación (2000-2024) y tasa de fecundidad por edad de la madre (Córdoba)"
          color="terracotta"
          as="h2"
        />

        <NatalidadFecundidad
          natalidadData={natalidadChartData}
          fecundidadEdadData={fecundidadEdadData}
          fecundidadAnio={fecundidadAnio}
          fecundidadOficialData={fecundidadOficialData}
        />
      </div>

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
