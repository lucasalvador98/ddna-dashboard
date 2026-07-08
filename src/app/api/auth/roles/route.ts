import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { APP_ROUTES } from '@/lib/rbac-types';
import type { Role, RolePermission } from '@/lib/rbac-types';

/**
 * GET  /api/auth/roles — List all roles with their permissions
 * POST /api/auth/roles — Create a new role
 */

export async function GET() {
  try {
    const adminClient = getSupabaseClient();

    const { data: roles, error: rolesError } = await adminClient
      .from('roles')
      .select('*')
      .order('id', { ascending: true });

    if (rolesError) {
      return NextResponse.json({ error: rolesError.message }, { status: 500 });
    }

    const { data: permissions, error: permsError } = await adminClient
      .from('role_permissions')
      .select('*')
      .order('id', { ascending: true });

    if (permsError) {
      return NextResponse.json({ error: permsError.message }, { status: 500 });
    }

    const rolesWithPermissions: Role[] = (roles ?? []).map((role) => ({
      ...role,
      permissions: (permissions ?? []).filter(
        (p: RolePermission) => p.role_id === role.id,
      ),
    }));

    return NextResponse.json(rolesWithPermissions);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: unknown;
      description?: unknown;
    };

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Se requiere un nombre válido para el rol' },
        { status: 400 },
      );
    }

    const adminClient = getSupabaseClient();

    // Create the role
    const { data: role, error: insertError } = await adminClient
      .from('roles')
      .insert({
        name: body.name.trim(),
        description: typeof body.description === 'string' ? body.description.trim() : null,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    // Auto-add view permissions for all app routes
    const defaultPermissions = APP_ROUTES.map((r) => ({
      role_id: role.id,
      route: r.route,
      can_view: true,
      can_edit: false,
    }));

    const { data: createdPerms, error: permsError } = await adminClient
      .from('role_permissions')
      .insert(defaultPermissions)
      .select();

    if (permsError) {
      // If permissions insert fails, clean up the previously created role
      await adminClient.from('roles').delete().eq('id', role.id);
      return NextResponse.json({ error: permsError.message }, { status: 500 });
    }

    const createdRole: Role = {
      ...role,
      permissions: createdPerms ?? [],
    };

    return NextResponse.json(createdRole, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 },
    );
  }
}
