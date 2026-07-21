'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseAdminClient } from '@/lib/supabase';

async function assertAdminAuth(): Promise<void> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // No-op in server actions
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('No autenticado. Inicie sesión para continuar.');
  }

  const adminClient = getSupabaseAdminClient();
  const { data: userRole } = await adminClient
    .from('user_roles')
    .select('role_id, roles(name)')
    .eq('user_id', user.id)
    .maybeSingle();

  const rolesData = userRole?.roles;
  const roleName =
    rolesData &&
    (Array.isArray(rolesData) ? (rolesData[0] as { name: string } | undefined) : (rolesData as { name: string }))
      ?.name;

  if (roleName !== 'admin') {
    throw new Error('Se requiere rol de administrador para esta operación.');
  }
}

export async function getAdminStats() {
  await assertAdminAuth();

  const admin = getSupabaseAdminClient();

  const [indicadores, datosIndicadores, fuentes, monitoreo, actores, grupos] = await Promise.all([
    admin.from('indicadores').select('id', { count: 'exact', head: true }),
    admin.from('datos_indicadores').select('id', { count: 'exact', head: true }),
    admin.from('fuentes_datos').select('id', { count: 'exact', head: true }),
    admin.from('monitoreo_registros').select('id', { count: 'exact', head: true }),
    admin.from('monitoreo_actores').select('id', { count: 'exact', head: true }),
    admin.from('grupos_indicadores').select('id', { count: 'exact', head: true }),
  ]);

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

  return {
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
  };
}
