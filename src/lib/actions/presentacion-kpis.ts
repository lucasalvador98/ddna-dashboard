'use server';

import { createClient } from '@supabase/supabase-js';
import type { KpiOption, KpisByAxis } from '@/lib/presentacion-ia';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function getPresentacionKpis(): Promise<{ kpis_por_eje: KpisByAxis; total: number }> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data, error } = await supabase
    .from('v_grupos_presentacion')
    .select('titulo, eje, categoria, tipo_viz, unidad, fuente_label, total_kpis, kpi_nombres, es_grupo')
    .order('eje', { ascending: true })
    .order('titulo', { ascending: true });

  if (error) {
    console.error('Error fetching grupos list:', error);
    throw new Error('Error al consultar indicadores');
  }

  const kpis_por_eje: KpisByAxis = {};
  for (const row of (data || []) as KpiOption[]) {
    if (!kpis_por_eje[row.eje]) kpis_por_eje[row.eje] = [];
    kpis_por_eje[row.eje].push(row);
  }

  return { kpis_por_eje, total: (data || []).length };
}
