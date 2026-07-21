import { createClient } from '@supabase/supabase-js';
import { Suspense } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { parseDesglose } from '@/lib/parse-desglose';
import { PageLoading } from '@/components/page-loading';
import { SectionHeader } from '@/components/section-header';
import { KpiCard } from '@/components/kpi-card';
import { INDICATOR_NAMES } from '@/lib/indicator-names';
import { SeguridadCharts } from './seguridad-charts';

type IndicadorRow = {
  id: string;
  indicador_nombre: string;
  valor: number;
  unidad: string;
  periodo: number;
  region: string;
  desglose: Record<string, unknown>;
  fuente: string;
};

const isCasosIndicator = (name: string) => name.toLowerCase().startsWith('casos de');

const crimeIndicators = [
  { name: INDICATOR_NAMES.TENTATIVAS_HURTO, label: 'Tentativas de hurto', color: '#3777FF' },
  { name: INDICATOR_NAMES.TASA_TENTATIVAS_HURTO, label: 'Tasa tentativas hurto (x100K)', color: '#BF1363' },
  { name: INDICATOR_NAMES.CONTRAVENCIONES, label: 'Contravenciones', color: '#F3A712' },
  { name: INDICATOR_NAMES.ROBOS_TENTATIVA_ROBO, label: 'Robos y tentativa', color: '#E07A5F' },
];

function getDistribucion(data: IndicadorRow[]) {
  return data
    .filter(d => isCasosIndicator(d.indicador_nombre))
    .map(d => ({
      name: d.indicador_nombre.replace('Casos de ', ''),
      value: Number(d.valor) || 0,
    }))
    .sort((a, b) => b.value - a.value);
}

function getCrimeSeries(data: IndicadorRow[], nombreIndicador: string) {
  return data
    .filter(d => d.indicador_nombre === nombreIndicador)
    .map(d => ({
      periodo: d.periodo,
      valor: Number(d.valor) || 0,
    }))
    .sort((a, b) => Number(a.periodo) - Number(b.periodo));
}

async function fetchSeguridadData(): Promise<IndicadorRow[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('indicadores')
    .select('id, indicador_nombre, valor, unidad, periodo, region, desglose, fuente')
    .eq('categoria', 'seguridad')
    .order('periodo', { ascending: false });

  if (error) throw error;

  return (data || []).map(d => ({
    ...d,
    desglose: parseDesglose(d.desglose),
  })) as IndicadorRow[];
}

export default function SeguridadPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Shield}
        title="Indicadores de Seguridad"
        description="Denuncias y casos en el sistema de justicia"
        color="blue"
      />
      <Suspense fallback={<PageLoading />}>
        <SeguridadContent />
      </Suspense>
    </div>
  );
}

async function SeguridadContent() {
  const data = await fetchSeguridadData();

  const distribucionData = getDistribucion(data);
  const total = distribucionData.reduce((sum, d) => sum + d.value, 0);

  const periodos = [...new Set(data.map(d => d.periodo))].sort((a, b) => {
    const aNum = typeof a === 'string' ? parseInt(a, 10) : (a as number);
    const bNum = typeof b === 'string' ? parseInt(b, 10) : (b as number);
    return bNum - aNum;
  });
  const latestPeriod = periodos[0] || '';

  const crimeSeries = crimeIndicators
    .map(ind => ({ ...ind, data: getCrimeSeries(data, ind.name) }))
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
    <>
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

      <SeguridadCharts
        distribucionData={distribucionData}
        total={total}
        crimeChartData={crimeChartData}
        crimeSeries={crimeSeries.map(s => ({ label: s.label, color: s.color }))}
        crimeYearRange={crimeYearRange}
      />
    </>
  );
}
