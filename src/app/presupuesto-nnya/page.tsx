import { createClient } from '@supabase/supabase-js';
import { Suspense } from 'react';
import { Coins } from 'lucide-react';
import { SectionHeader } from '@/components/section-header';
import { PageLoading } from '@/components/page-loading';
import PresupuestoNnyaCharts from './presupuesto-nnya-charts';
import {
  normalizeInversionRow,
  computePeriods,
  computeChangeData,
  computeEvolutionData,
} from '@/lib/compute-presupuesto';
import type { InversionRow } from '@/lib/compute-presupuesto';

async function fetchInversionData(): Promise<InversionRow[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('indicadores')
    .select('periodo, valor, desglose')
    .eq('categoria', 'inversion')
    .eq('activo', true)
    .order('periodo', { ascending: false });

  if (error) throw error;
  return (data || []).map(r => normalizeInversionRow(r as Record<string, unknown>));
}

async function PresupuestoNnyaContent() {
  const inversionData = await fetchInversionData();
  const periods = computePeriods(inversionData);
  const evolutionData = computeEvolutionData(inversionData, periods);
  const changeData = computeChangeData(inversionData, periods);

  return (
    <PresupuestoNnyaCharts
      inversionData={inversionData}
      periods={periods}
      evolutionData={evolutionData}
      changeData={changeData}
    />
  );
}

export default function PresupuestoNnyaPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Coins}
        title="Presupuesto NNyA Interactivo"
        description="Inversión provincial en infancia y adolescencia con metodología DNPPE/UNICEF"
        color="terracotta"
      />
      <Suspense fallback={<PageLoading />}>
        <PresupuestoNnyaContent />
      </Suspense>
    </div>
  );
}
