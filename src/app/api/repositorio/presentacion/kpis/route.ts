/**
 * GET /api/repositorio/presentacion/kpis
 *
 * Returns available items from v_grupos_presentacion grouped by axis.
 * Each item is either a group (es_grupo=true, multiple kpi_nombres) or
 * a single card indicator (es_grupo=false, one kpi_nombre).
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export interface GrupoOption {
  /** Display name shown in the selector */
  titulo: string;
  eje: string;
  categoria: string;
  tipo_viz: string;
  unidad: string;
  fuente_label: string;
  total_kpis: number;
  /** Full list of indicador_nombre values to send to the presentation API */
  kpi_nombres: string[];
  es_grupo: boolean;
}

export interface GruposByAxis {
  [eje: string]: GrupoOption[];
}

export async function GET() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data, error } = await supabase
      .from('v_grupos_presentacion')
      .select('titulo, eje, categoria, tipo_viz, unidad, fuente_label, total_kpis, kpi_nombres, es_grupo')
      .order('eje', { ascending: true })
      .order('titulo', { ascending: true });

    if (error) {
      console.error('Error fetching grupos list:', error);
      return NextResponse.json({ error: 'Error al consultar indicadores' }, { status: 500 });
    }

    const grouped: GruposByAxis = {};
    for (const row of (data || []) as GrupoOption[]) {
      if (!grouped[row.eje]) grouped[row.eje] = [];
      grouped[row.eje].push(row);
    }

    const total = (data || []).length;

    return NextResponse.json({ kpis_por_eje: grouped, total });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
