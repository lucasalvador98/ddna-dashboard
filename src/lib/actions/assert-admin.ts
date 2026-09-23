'use server';

// Shared admin guard for server actions. Extracted from the pattern in
// src/lib/actions/admin-stats.ts (existing files left untouched, additive only).

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseAdminClient } from '@/lib/supabase';

export async function assertAdminAuth(): Promise<void> {
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
