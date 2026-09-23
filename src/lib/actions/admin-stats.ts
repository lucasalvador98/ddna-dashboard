'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { retry } from '@/lib/retry';

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
        setAll(cookiesToSet) {
          // Persist rotated tokens. getUser()/refresh can rotate the session
          // server-side; dropping the new cookies leaves the browser with a
          // revoked refresh token and the user stuck in a 401 loop.
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
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
  const { data: userRole } = await retry(
    () =>
      adminClient
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', user.id)
        .maybeSingle(),
    { extractError: (r) => (r as { error: unknown }).error }
  );

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
    retry(
      () => admin.from('indicadores').select('id', { count: 'exact', head: true }),
      { extractError: (r) => (r as { error: unknown }).error }
    ),
    retry(
      () => admin.from('datos_indicadores').select('id', { count: 'exact', head: true }),
      { extractError: (r) => (r as { error: unknown }).error }
    ),
    retry(
      () => admin.from('fuentes_datos').select('id', { count: 'exact', head: true }),
      { extractError: (r) => (r as { error: unknown }).error }
    ),
    retry(
      () => admin.from('monitoreo_registros').select('id', { count: 'exact', head: true }),
      { extractError: (r) => (r as { error: unknown }).error }
    ),
    retry(
      () => admin.from('monitoreo_actores').select('id', { count: 'exact', head: true }),
      { extractError: (r) => (r as { error: unknown }).error }
    ),
    retry(
      () => admin.from('grupos_indicadores').select('id', { count: 'exact', head: true }),
      { extractError: (r) => (r as { error: unknown }).error }
    ),
  ]);

  const [latestIndicador, latestMonitoreo] = await Promise.all([
    retry(
      () =>
        admin
          .from('datos_indicadores')
          .select('periodo')
          .order('periodo', { ascending: false })
          .limit(1)
          .maybeSingle(),
      { extractError: (r) => (r as { error: unknown }).error }
    ),
    retry(
      () =>
        admin
          .from('monitoreo_registros')
          .select('fecha_publicacion')
          .order('fecha_publicacion', { ascending: false })
          .limit(1)
          .maybeSingle(),
      { extractError: (r) => (r as { error: unknown }).error }
    ),
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
