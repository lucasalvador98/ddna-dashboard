import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import type { UserRole } from '@/lib/rbac-types';
import { checkAdminAuth } from '@/lib/auth-guard';

/**
 * GET /api/auth/users/[id]/role — Get a specific user's role
 * PUT /api/auth/users/[id]/role — Assign a role to a user
 */

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const guard = await checkAdminAuth();
    if (!guard.authorized) return guard.response!;

    const { id } = await params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'ID de usuario inválido' }, { status: 400 });
    }

    const adminClient = getSupabaseClient();

    // Fetch the user role with role name
    const { data, error } = await adminClient
      .from('user_roles')
      .select('user_id, role_id, created_at, roles(name)')
      .eq('user_id', id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If no role assigned yet, return a default "no role" response
    if (!data) {
      const userRole: UserRole = {
        user_id: id,
        email: '',
        role_id: 0,
        role_name: 'sin_rol',
        created_at: '',
      };
      return NextResponse.json(userRole);
    }

    // Fetch user email from auth
    const { data: authUser, error: authError } =
      await adminClient.auth.admin.getUserById(id);

    const rolesData = (Array.isArray(data.roles) ? data.roles[0] : data.roles) as { name: string } | null;

    const userRole: UserRole = {
      user_id: data.user_id,
      email: authUser?.user?.email ?? '',
      role_id: data.role_id,
      role_name: rolesData?.name ?? '',
      created_at: data.created_at,
    };

    return NextResponse.json(userRole);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const guard = await checkAdminAuth();
    if (!guard.authorized) return guard.response!;

    const { id } = await params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'ID de usuario inválido' }, { status: 400 });
    }

    const body = (await request.json()) as { role_id?: unknown };

    if (body.role_id === undefined || typeof body.role_id !== 'number') {
      return NextResponse.json(
        { error: 'Se requiere "role_id" (number)' },
        { status: 400 },
      );
    }

    const adminClient = getSupabaseClient();

    // Prevent demoting the last remaining admin
    // 1. Fetch the user's current role
    const { data: currentUserRole } = await adminClient
      .from('user_roles')
      .select('role_id, roles(name)')
      .eq('user_id', id)
      .maybeSingle();

    const currentRoleData = currentUserRole?.roles;
    const currentRoleName =
      currentRoleData &&
      (Array.isArray(currentRoleData)
        ? (currentRoleData[0] as { name: string } | undefined)
        : (currentRoleData as { name: string })
      )?.name;

    // 2. Fetch the target role name
    const { data: targetRole } = await adminClient
      .from('roles')
      .select('name')
      .eq('id', body.role_id)
      .maybeSingle();

    const targetRoleName = targetRole?.name;

    // 3. If demoting from admin to non-admin, check if this is the last admin
    if (currentRoleName === 'admin' && targetRoleName !== 'admin') {
      const { count: adminCount } = await adminClient
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role_id', 1); // admin role_id = 1

      if (adminCount !== null && adminCount < 2) {
        return NextResponse.json(
          { error: 'No se puede quitar el rol de administrador al último admin del sistema.' },
          { status: 403 }
        );
      }
    }

    // Upsert: only one role per user (unique constraint on user_id)
    const { data: ur, error: upsertError } = await adminClient
      .from('user_roles')
      .upsert(
        { user_id: id, role_id: body.role_id },
        { onConflict: 'user_id' },
      )
      .select('user_id, role_id, created_at, roles(name)')
      .single();

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    // Fetch user email from auth
    const { data: authUser, error: authError } =
      await adminClient.auth.admin.getUserById(id);

    const rolesData = (Array.isArray(ur.roles) ? ur.roles[0] : ur.roles) as { name: string } | null;

    const userRole: UserRole = {
      user_id: ur.user_id,
      email: authUser?.user?.email ?? '',
      role_id: ur.role_id,
      role_name: rolesData?.name ?? '',
      created_at: ur.created_at,
    };

    return NextResponse.json(userRole);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 },
    );
  }
}
