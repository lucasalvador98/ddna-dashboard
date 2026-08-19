import { createClient } from '@supabase/supabase-js';
import { Suspense } from 'react';
import { Coins } from 'lucide-react';
import { SectionHeader } from '@/components/section-header';
import { PageLoading } from '@/components/page-loading';
import { parseDesglose } from '@/lib/parse-desglose';
import { InversionCharts } from './inversion-charts';
import type { InversionRow } from './inversion-charts';

const AREA_ORDER = ['Educación', 'Salud', 'Desarrollo Social', 'Niñez y Adolescencia', 'Otros'];

function buildEvolutionData(inversionData: InversionRow[], periods: string[]): Record<string, unknown>[] {
  if (periods.length === 0) return [];

  const periodMap = new Map<string, Record<string, number>>();
  for (const p of periods) {
    periodMap.set(p, {
      Educación: 0,
      Salud: 0,
      'Desarrollo Social': 0,
      'Niñez y Adolescencia': 0,
      Otros: 0,
    });
  }

  for (const d of inversionData) {
    const p = d.periodo;
    const area = (d.desglose?.area as string) || 'Otros';
    const entry = periodMap.get(p);
    if (entry && area in entry) {
      entry[area] += Number(d.valor || 0);
    }
  }

  return periods
    .map(periodo => ({
      periodo,
      ...(periodMap.get(periodo) || {}),
    }))
    .reverse();
}

async function fetchInversionData(): Promise<InversionRow[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('indicadores')
    .select('id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente')
    .eq('categoria', 'inversion')
    .order('periodo', { ascending: false })
    .limit(10000);

  if (error) throw error;

  return (data || []).map(r => ({
    ...r,
    desglose: parseDesglose(r.desglose),
    valor: Number(r.valor) || 0,
  })) as InversionRow[];
}

async function InversionContent() {
  const inversionData = await fetchInversionData();

  const periods = [...new Set(inversionData.map(d => d.periodo))].sort((a, b) => {
    const aNum = typeof a === 'string' ? parseInt(a, 10) : (a as number);
    const bNum = typeof b === 'string' ? parseInt(b, 10) : (b as number);
    return bNum - aNum;
  });

  const evolutionData = buildEvolutionData(inversionData, periods);

  return (
    <InversionCharts
      inversionData={inversionData}
      periods={periods}
      evolutionData={evolutionData}
    />
  );
}

export default function InversionPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Coins}
        title="Indicadores de Inversión"
        description="Inversión social en infancia y adolescencia en Córdoba"
        color="terracotta"
      />
      <Suspense fallback={<PageLoading />}>
        <InversionContent />
      </Suspense>
    </div>
  );
}
