import { createClient } from '@supabase/supabase-js';
import { Users, Info } from 'lucide-react';
import { SectionHeader } from '@/components/section-header';
import { parseDesglose } from '@/lib/parse-desglose';
import { INDICATOR_NAMES } from '@/lib/indicator-names';
import PobrezaCharts from './pobreza-charts';

// ─── Types ──────────────────────────────────────────────────────
type IndicadorRow = {
  indicador_nombre: string;
  valor: number;
  periodo: number;
  desglose: Record<string, unknown>;
  fuente: string;
  region: string;
};

// ─── Constants ──────────────────────────────────────────────────
const INDEC_FUENTE = 'EPH-INDEC / datos.gob.ar';

const NECESITA_UCA_INDICADORES = [
  'Pobreza monetaria (personas)',
  'Indigencia (personas)',
  'Inseguridad alimentaria total',
  'Pobreza multidimensional (2+ carencias)',
  'Inseguridad alimentaria total (personas)',
  'Inseguridad alimentaria total (hogares)',
  'No festejó el ultimo cumpleaños',
  'No suele compartir cuentos y lecturas en familia',
  'No suele usar internet',
  'No suele leer textos impresos',
  'Trabajo no registrado en la Seguridad Social',
  'Desempleo',
  'Empleo no registrado (informal)',
  'Hacinamiento (I)',
  'Déficit de saneamiento',
  'Vivienda precaria',
  'Calles sin pavimentar',
  'Situación de pobreza (personas)',
  'Situación de indigencia (personas)',
  'Insuficiencia de ingresos (auto-percibido)',
];

// ─── Helpers ────────────────────────────────────────────────────
function fmt(val?: number | null): string {
  if (val == null || isNaN(val)) return 'N/D';
  return `${val.toFixed(1)}%`;
}

function calcChange(curr?: number, prev?: number) {
  if (curr == null || prev == null || prev === 0) return null;
  const diff = curr - prev;
  return {
    label: `${diff > 0 ? '+' : ''}${diff.toFixed(1)} pp`,
    up: diff > 0,
  };
}

function periodoLabel(p: number, desglose: Record<string, unknown>): string {
  const semestre = desglose?.semestre;
  if (semestre === 1) return `1° sem ${p}`;
  if (semestre === 2) return `2° sem ${p}`;
  return String(p);
}

function getSemestre(d: IndicadorRow): number {
  return Number(d.desglose?.semestre ?? 0);
}

// ─── Data Fetching ──────────────────────────────────────────────
async function fetchAllData(): Promise<{ indecData: IndicadorRow[]; ucaData: IndicadorRow[] }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function fetchAllUca(): Promise<IndicadorRow[]> {
    const PAGE = 1000;
    let offset = 0;
    const rows: IndicadorRow[] = [];

    while (true) {
      const { data, error: pgErr } = await supabase
        .from('indicadores')
        .select('indicador_nombre, valor, periodo, desglose, fuente, region')
        .eq('categoria', 'pobreza')
        .eq('activo', true)
        .in('indicador_nombre', NECESITA_UCA_INDICADORES)
        .or('desglose->>categoria.is.null,desglose->>categoria.eq.Total')
        .order('periodo', { ascending: true })
        .range(offset, offset + PAGE - 1);

      if (pgErr) throw pgErr;
      if (!data || data.length === 0) break;

      rows.push(
        ...(data.map(r => ({
          ...r,
          desglose: parseDesglose(r.desglose),
        })) as IndicadorRow[])
      );

      if (data.length < PAGE) break;
      offset += PAGE;
    }

    return rows;
  }

  const [indecRes, ucaRows] = await Promise.all([
    supabase
      .from('indicadores')
      .select('indicador_nombre, valor, periodo, desglose, fuente, region')
      .eq('categoria', 'pobreza')
      .eq('fuente', INDEC_FUENTE)
      .eq('activo', true)
      .order('periodo', { ascending: true }),
    fetchAllUca(),
  ]);

  if (indecRes.error) throw indecRes.error;

  return {
    indecData: (indecRes.data || []).map(r => ({
      ...r,
      desglose: parseDesglose(r.desglose),
    })) as IndicadorRow[],
    ucaData: ucaRows,
  };
}

// ─── Page Component (Server Component) ──────────────────────────
export default async function PobrezaPage() {
  const { indecData, ucaData } = await fetchAllData();

  // ─── Empty state ──────────────────────────────────────────────
  if (indecData.length === 0 && ucaData.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader
          icon={Users}
          title="Pobreza e Indigencia"
          description="Medición por ingresos (INDEC) y multidimensional (UCA-ODSA)"
          color="magenta"
        />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Info className="w-12 h-12 text-gray-300 mb-4" />
          <p className="font-body text-gray-600">No hay datos disponibles</p>
          <p className="text-sm text-gray-400 mt-1">
            Los datos de pobreza aún no se han cargado en la base.
          </p>
        </div>
      </div>
    );
  }

  // ─── INDEC processed data ─────────────────────────────────────
  const indecGetAll = (indicatorName: string) =>
    indecData
      .filter(r => r.indicador_nombre === indicatorName)
      .map(r => ({ year: r.periodo, semestre: Number(r.desglose?.semestre) || 0, valor: r.valor }));

  const phAll = indecGetAll(INDICATOR_NAMES.POBREZA_HOGARES);
  const ppAll = indecGetAll(INDICATOR_NAMES.POBREZA_PERSONAS);

  const periodSet = new Map<string, { year: number; semestre: number; label: string }>();
  for (const d of [...phAll, ...ppAll]) {
    const key = `${d.year}-${d.semestre}`;
    if (!periodSet.has(key)) {
      periodSet.set(key, {
        year: d.year,
        semestre: d.semestre,
        label: periodoLabel(d.year, { semestre: d.semestre || undefined }),
      });
    }
  }

  const sortedPeriods = [...periodSet.values()].sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.semestre - b.semestre
  );

  const evoChartData = sortedPeriods.map(p => ({
    label: p.label,
    Hogares: phAll.find(d => d.year === p.year && d.semestre === p.semestre)?.valor ?? undefined,
    Personas: ppAll.find(d => d.year === p.year && d.semestre === p.semestre)?.valor ?? undefined,
  }));

  const getLatest = (name: string, semestre?: number) => {
    let filtered = indecData
      .filter(r => r.indicador_nombre === name)
      .sort((a, b) => b.periodo - a.periodo);
    if (semestre !== undefined) filtered = filtered.filter(r => r.desglose?.semestre === semestre);
    return filtered[0];
  };

  const getPrev = (name: string, latestPeriodo: number, semestre?: number) => {
    const candidates = indecData.filter(r => {
      if (r.indicador_nombre !== name) return false;
      const rPeriodo = Number(r.periodo);
      if (isNaN(rPeriodo)) return false;
      if (semestre !== undefined && r.desglose?.semestre !== undefined) {
        if (rPeriodo === latestPeriodo && getSemestre(r) < semestre) return true;
        if (rPeriodo < latestPeriodo) return true;
        return false;
      }
      return rPeriodo < latestPeriodo;
    });
    candidates.sort((a, b) => {
      const pDiff = Number(b.periodo) - Number(a.periodo);
      if (pDiff !== 0) return pDiff;
      return getSemestre(b) - getSemestre(a);
    });
    return candidates.length > 0 ? candidates[0] : undefined;
  };

  const latestPH = getLatest(INDICATOR_NAMES.POBREZA_HOGARES);
  const latestPP = getLatest(INDICATOR_NAMES.POBREZA_PERSONAS);
  const latestDesempleo = getLatest(INDICATOR_NAMES.TASA_DESEMPLEO);

  const prevPH = latestPH
    ? getPrev(INDICATOR_NAMES.POBREZA_HOGARES, latestPH.periodo, Number(latestPH.desglose?.semestre))
    : undefined;
  const prevPP = latestPP
    ? getPrev(INDICATOR_NAMES.POBREZA_PERSONAS, latestPP.periodo, Number(latestPP.desglose?.semestre))
    : undefined;

  const changePH = calcChange(latestPH?.valor, prevPH?.valor);
  const changePP = calcChange(latestPP?.valor, prevPP?.valor);

  const allPeriods = [...new Set(indecData.map(r => r.periodo))].sort((a, b) => b - a).slice(0, 5);
  const tableRows = allPeriods.map(p => {
    const ph = indecData
      .filter(r => r.indicador_nombre === INDICATOR_NAMES.POBREZA_HOGARES && r.periodo === p)
      .sort((a, b) => getSemestre(b) - getSemestre(a))[0];
    const pp = indecData
      .filter(r => r.indicador_nombre === INDICATOR_NAMES.POBREZA_PERSONAS && r.periodo === p)
      .sort((a, b) => getSemestre(b) - getSemestre(a))[0];
    return {
      periodo: periodoLabel(p, ph?.desglose ?? pp?.desglose ?? {}),
      ph: fmt(ph?.valor),
      pp: fmt(pp?.valor),
    };
  });

  const indecIndigenciaHogares = indecData
    .filter(r => r.indicador_nombre === INDICATOR_NAMES.INDIGENCIA_HOGARES)
    .sort((a, b) => b.periodo - a.periodo)[0];

  // ─── UCA processed data ───────────────────────────────────────
  const ucaLatest = (name: string) =>
    ucaData.filter(r => r.indicador_nombre === name).sort((a, b) => b.periodo - a.periodo)[0];

  const ucMonetaria = ucaLatest(INDICATOR_NAMES.POBREZA_MONETARIA_PERSONAS);
  const ucIndigencia = ucaLatest(INDICATOR_NAMES.INDIGENCIA_PERSONAS);
  const ucInseguridad = ucaLatest(INDICATOR_NAMES.INSEGURIDAD_ALIMENTARIA_TOTAL);
  const ucMultidimensional = ucaLatest(INDICATOR_NAMES.POBREZA_MULTIDIMENSIONAL);

  // ─── UCA dimension chart data ─────────────────────────────────
  const ucaTotal = ucaData.filter(r => {
    const d = r.desglose as Record<string, unknown>;
    return d?.categoria === 'Total';
  });
  const ucaForDimensions = ucaTotal.length > 0 ? ucaTotal : ucaData;

  const DIMENSION_LABELS: Record<string, string> = {
    alimentacion: 'Alimentación',
    crianza: 'Crianza',
    informacion: 'Información',
    empleo: 'Empleo',
    habitat: 'Hábitat',
    multidimensional: 'Multidimensional',
  };

  const DIMENSION_FILLS: Record<string, string> = {
    alimentacion: '#BF1363',
    crianza: '#E07A5F',
    informacion: '#3777FF',
    empleo: '#F3A712',
    habitat: '#FF7F11',
    multidimensional: '#10B981',
  };

  const PRIORITY_INDICATORS: Record<string, string[]> = {
    alimentacion: [
      'Inseguridad alimentaria total (personas)',
      'Inseguridad alimentaria total (hogares)',
      'Inseguridad alimentaria total',
    ],
    crianza: [
      'No festejó el ultimo cumpleaños',
      'No suele compartir cuentos y lecturas en familia',
    ],
    informacion: ['No suele usar internet', 'No suele leer textos impresos'],
    empleo: [
      'Trabajo no registrado en la Seguridad Social',
      'Desempleo',
      'Empleo no registrado (informal)',
    ],
    habitat: [
      'Hacinamiento (I)',
      'Déficit de saneamiento',
      'Vivienda precaria',
      'Calles sin pavimentar',
    ],
    multidimensional: [
      'Situación de pobreza (personas)',
      'Situación de indigencia (personas)',
      'Insuficiencia de ingresos (auto-percibido)',
    ],
  };

  const dimensions = [
    ...new Set(
      ucaForDimensions
        .map(r => (r.desglose as Record<string, unknown>)?.dimension as string)
        .filter(Boolean)
    ),
  ];

  const getDimensionValue = (dimension: string) => {
    const priorities = PRIORITY_INDICATORS[dimension] || [];
    for (const indicatorName of priorities) {
      const records = ucaForDimensions
        .filter(
          r =>
            (r.desglose as Record<string, unknown>)?.dimension === dimension &&
            r.indicador_nombre === indicatorName
        )
        .sort((a, b) => b.periodo - a.periodo);
      if (records.length > 0) return records[0];
    }
    const any = ucaForDimensions
      .filter(r => (r.desglose as Record<string, unknown>)?.dimension === dimension)
      .sort((a, b) => Number(b.valor) - Number(a.valor));
    return any[0];
  };

  const dimensionChartData = dimensions
    .map(dim => ({
      dimension: DIMENSION_LABELS[dim] || dim,
      valor: Number(getDimensionValue(dim)?.valor) || 0,
      fill: DIMENSION_FILLS[dim] || '#3777FF',
      indicator: getDimensionValue(dim)?.indicador_nombre || '',
      periodo: getDimensionValue(dim)?.periodo || 0,
    }))
    .sort((a, b) => b.valor - a.valor);

  // ─── UCA historic chart data ──────────────────────────────────
  const getHistoricSeries = (indicatorName: string) =>
    ucaForDimensions
      .filter(r => r.indicador_nombre === indicatorName)
      .map(r => ({ periodo: r.periodo, valor: Number(r.valor) || 0 }))
      .sort((a, b) => a.periodo - b.periodo);

  const historicAlimentaria = getHistoricSeries('Inseguridad alimentaria total (personas)');
  const historicEmpleo = getHistoricSeries('Trabajo no registrado en la Seguridad Social');
  const historicHacinamiento = getHistoricSeries('Hacinamiento (I)');
  const historicInternet = getHistoricSeries('No suele usar internet');

  const historicData = (() => {
    const allYears = [
      ...new Set([
        ...historicAlimentaria.map(d => d.periodo),
        ...historicEmpleo.map(d => d.periodo),
        ...historicHacinamiento.map(d => d.periodo),
        ...historicInternet.map(d => d.periodo),
      ]),
    ].sort();

    return allYears.map(year => ({
      periodo: year,
      'Inseguridad alimentaria': historicAlimentaria.find(d => d.periodo === year)?.valor ?? null,
      'Empleo no registrado': historicEmpleo.find(d => d.periodo === year)?.valor ?? null,
      Hacinamiento: historicHacinamiento.find(d => d.periodo === year)?.valor ?? null,
      'Sin internet': historicInternet.find(d => d.periodo === year)?.valor ?? null,
    }));
  })();

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Users}
        title="Pobreza e Indigencia"
        description="Indicadores de condiciones socioeconómicas — Córdoba (EPH-INDEC & UCA-ODSA). Medición por ingresos y enfoque multidimensional de derechos."
        color="magenta"
      />
      <PobrezaCharts
        indecData={indecData}
        ucaData={ucaData}
        evoChartData={evoChartData}
        tableRows={tableRows}
        latestPH={latestPH}
        latestPP={latestPP}
        latestDesempleo={latestDesempleo}
        indecIndigenciaHogares={indecIndigenciaHogares}
        changePH={changePH}
        changePP={changePP}
        dimensionChartData={dimensionChartData}
        historicData={historicData}
        ucMonetaria={ucMonetaria}
        ucIndigencia={ucIndigencia}
        ucInseguridad={ucInseguridad}
        ucMultidimensional={ucMultidimensional}
      />
    </div>
  );
}
