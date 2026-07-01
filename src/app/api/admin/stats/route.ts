import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

/**
 * GET /api/admin/stats
 *
 * Returns dashboard statistics for the admin panel.
 * Uses service_role key — safe because this is a server-side API route.
 */
export async function GET() {
  try {
    const admin = getSupabaseClient();

    // Run all counts in parallel
    const [indicadores, datosIndicadores, fuentes, monitoreo, actores, grupos] = await Promise.all([
      admin.from('indicadores').select('id', { count: 'exact', head: true }),
      admin.from('datos_indicadores').select('id', { count: 'exact', head: true }),
      admin.from('fuentes_datos').select('id', { count: 'exact', head: true }),
      admin.from('monitoreo_registros').select('id', { count: 'exact', head: true }),
      admin.from('monitoreo_actores').select('id', { count: 'exact', head: true }),
      admin.from('grupos_indicadores').select('id', { count: 'exact', head: true }),
    ]);

    // Get latest dates for key tables
    const [latestIndicador, latestMonitoreo] = await Promise.all([
      admin
        .from('datos_indicadores')
        .select('periodo')
        .order('periodo', { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from('monitoreo_registros')
        .select('fecha_publicacion')
        .order('fecha_publicacion', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    return NextResponse.json({
      counts: {
        indicadores: indicadores.count ?? 0,
        datos_indicadores: datosIndicadores.count ?? 0,
        fuentes: fuentes.count ?? 0,
        monitoreo_registros: monitoreo.count ?? 0,
        monitoreo_actores: actores.count ?? 0,
        grupos: grupos.count ?? 0,
      },
      latest: {
        indicador_periodo: latestIndicador.data?.periodo ?? null,
        monitoreo_fecha: latestMonitoreo.data?.fecha_publicacion ?? null,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
