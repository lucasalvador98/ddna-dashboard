import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import type { UserRole } from '@/lib/rbac-types';
import { checkAdminAuth } from '@/lib/auth-guard';

/**
 * GET /api/auth/users — List all auth users with their roles
 */

export async function GET() {
  try {
    const guard = await checkAdminAuth();
    if (!guard.authorized) return guard.response!;

    const adminClient = getSupabaseClient();

    // Get all auth users from Supabase Auth
    const { data: authData, error: authError } =
      await adminClient.auth.admin.listUsers();

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // Get all user_roles with joined role names
    const { data: userRoles, error: urError } = await adminClient
      .from('user_roles')
      .select('user_id, role_id, created_at, roles(name)');

    if (urError) {
      return NextResponse.json({ error: urError.message }, { status: 500 });
    }

    // Build a lookup map: user_id -> { role_id, role_name, created_at }
    const roleMap = new Map<
      string,
      { role_id: number; role_name: string; created_at: string }
    >();

    for (const ur of userRoles ?? []) {
      const rolesData = (Array.isArray(ur.roles) ? ur.roles[0] : ur.roles) as { name: string } | null;
      roleMap.set(ur.user_id, {
        role_id: ur.role_id,
        role_name: rolesData?.name ?? '',
        created_at: ur.created_at,
      });
    }

    // Build the UserRole response
    const users: UserRole[] = (authData?.users ?? []).map((u) => {
      const roleInfo = roleMap.get(u.id);
      return {
        user_id: u.id,
        email: u.email ?? '',
        role_id: roleInfo?.role_id ?? 0,
        role_name: roleInfo?.role_name ?? 'sin_rol',
        created_at: roleInfo?.created_at ?? u.created_at ?? '',
      };
    });

    return NextResponse.json(users);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 },
    );
  }
}
