import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { checkAdminAuth } from '@/lib/auth-guard';

/**
 * GET  /api/auth/admins — List users with their assigned role
 * POST /api/auth/admins — Create a user and assign a role
 *
 * The role comes from public.user_roles (source of truth), never from
 * user_metadata: raw_user_meta_data is user-editable and therefore useless for
 * authorization. user_metadata.role is still written as a non-authoritative
 * label for external tooling.
 */

export async function GET() {
  try {
    const guard = await checkAdminAuth();
    if (!guard.authorized) return guard.response!;

    const adminClient = getSupabaseClient();

    const { data, error } = await adminClient.auth.admin.listUsers();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: userRoles, error: rolesError } = await adminClient
      .from('user_roles')
      .select('user_id, role_id, roles(name)');

    if (rolesError) {
      return NextResponse.json({ error: rolesError.message }, { status: 500 });
    }

    const roleMap = new Map<string, { role_id: number; role_name: string }>();

    for (const ur of userRoles ?? []) {
      const rolesData = (Array.isArray(ur.roles) ? ur.roles[0] : ur.roles) as {
        name: string;
      } | null;
      roleMap.set(ur.user_id, {
        role_id: ur.role_id,
        role_name: rolesData?.name ?? '',
      });
    }

    const users = (data?.users || []).map((u) => {
      const role = roleMap.get(u.id);
      return {
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        role_id: role?.role_id ?? 0,
        role_name: role?.role_name ?? 'sin_rol',
      };
    });

    return NextResponse.json(users);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const guard = await checkAdminAuth();
    if (!guard.authorized) return guard.response!;

    const { email, password, role_id } = (await request.json()) as {
      email?: string;
      password?: string;
      role_id?: unknown;
    };

    if (!email || !password) {
      return NextResponse.json({ error: 'Se requiere email y password' }, { status: 400 });
    }

    if (role_id !== undefined && (typeof role_id !== 'number' || !Number.isInteger(role_id))) {
      return NextResponse.json(
        { error: 'El campo "role_id" debe ser un número entero' },
        { status: 400 },
      );
    }

    const adminClient = getSupabaseClient();

    // Resolve the role before creating anything: a bad role_id must not leave
    // an orphaned auth user behind. Without role_id the admin role is the
    // historical default of this endpoint.
    let roleId: number;
    let roleName: string;

    if (typeof role_id === 'number') {
      const { data: role, error: roleLookupError } = await adminClient
        .from('roles')
        .select('id, name')
        .eq('id', role_id)
        .maybeSingle();

      if (roleLookupError) {
        return NextResponse.json({ error: roleLookupError.message }, { status: 500 });
      }

      if (!role) {
        return NextResponse.json(
          { error: 'El rol indicado no existe' },
          { status: 400 },
        );
      }

      roleId = role.id;
      roleName = role.name;
    } else {
      const { data: adminRole, error: adminRoleError } = await adminClient
        .from('roles')
        .select('id, name')
        .eq('name', 'admin')
        .maybeSingle();

      if (adminRoleError) {
        return NextResponse.json({ error: adminRoleError.message }, { status: 500 });
      }

      if (!adminRole) {
        return NextResponse.json(
          { error: 'No se encontró el rol "admin" por defecto' },
          { status: 500 },
        );
      }

      roleId = adminRole.id;
      roleName = adminRole.name;
    }

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      // Non-authoritative label only: user_metadata is user-editable, so the
      // permission checks read public.user_roles instead.
      user_metadata: { role: roleName },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data?.user?.id) {
      return NextResponse.json(
        { error: 'Supabase no devolvió el usuario creado' },
        { status: 500 },
      );
    }

    const { error: roleError } = await adminClient
      .from('user_roles')
      .upsert({ user_id: data.user.id, role_id: roleId }, { onConflict: 'user_id' });

    if (roleError) {
      // The user exists but has no role: surface it instead of swallowing the
      // error, so the admin can assign the role from the user list (S2).
      return NextResponse.json(
        {
          error: `Usuario creado, pero no se pudo asignar el rol "${roleName}": ${roleError.message}. Asignalo manualmente desde la lista de usuarios.`,
          user_id: data.user.id,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      user_id: data.user.id,
      role: { id: roleId, name: roleName },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
