'use server';

import { getSupabaseAdminClient } from '@/lib/supabase';
import { checkAdminAuth } from '@/lib/auth-guard';
import type { UserRole } from '@/lib/rbac-types';

export async function getUsers(): Promise<UserRole[]> {
  const guard = await checkAdminAuth();
  if (!guard.authorized) {
    throw new Error('No autorizado');
  }

  const adminClient = getSupabaseAdminClient();

  const { data: authData, error: authError } =
    await adminClient.auth.admin.listUsers();

  if (authError) {
    throw new Error(authError.message);
  }

  const { data: userRoles, error: urError } = await adminClient
    .from('user_roles')
    .select('user_id, role_id, created_at, roles(name)');

  if (urError) {
    throw new Error(urError.message);
  }

  const roleMap = new Map<
    string,
    { role_id: number; role_name: string; created_at: string }
  >();

  for (const ur of userRoles ?? []) {
    const rolesData = (Array.isArray(ur.roles) ? ur.roles[0] : ur.roles) as {
      name: string;
    } | null;
    roleMap.set(ur.user_id, {
      role_id: ur.role_id,
      role_name: rolesData?.name ?? '',
      created_at: ur.created_at,
    });
  }

  return (authData?.users ?? []).map((u) => {
    const roleInfo = roleMap.get(u.id);
    return {
      user_id: u.id,
      email: u.email ?? '',
      role_id: roleInfo?.role_id ?? 0,
      role_name: roleInfo?.role_name ?? 'sin_rol',
      created_at: roleInfo?.created_at ?? u.created_at ?? '',
    };
  });
}
