import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import type { RolePermission } from '@/lib/rbac-types';

/**
 * PUT /api/auth/roles/[id]/permissions — Replace all permissions for a role
 */

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const roleId = Number(id);

    if (!Number.isFinite(roleId)) {
      return NextResponse.json({ error: 'ID de rol inválido' }, { status: 400 });
    }

    const body = (await request.json()) as {
      permissions?: unknown;
    };

    if (!Array.isArray(body.permissions)) {
      return NextResponse.json(
        { error: 'Se requiere un array "permissions"' },
        { status: 400 },
      );
    }

    // Validate each permission entry
    for (const perm of body.permissions) {
      if (
        !perm ||
        typeof perm !== 'object' ||
        typeof (perm as Record<string, unknown>).route !== 'string' ||
        typeof (perm as Record<string, unknown>).can_view !== 'boolean' ||
        typeof (perm as Record<string, unknown>).can_edit !== 'boolean'
      ) {
        return NextResponse.json(
          {
            error:
              'Cada permiso debe tener: route (string), can_view (boolean), can_edit (boolean)',
          },
          { status: 400 },
        );
      }
    }

    const adminClient = getSupabaseClient();

    // Delete existing permissions for this role
    const { error: deleteError } = await adminClient
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Insert new permissions (skip if empty array — effectively revokes all)
    if (body.permissions.length > 0) {
      const newPermissions = body.permissions.map(
        (p: { route: string; can_view: boolean; can_edit: boolean }) => ({
          role_id: roleId,
          route: p.route,
          can_view: p.can_view,
          can_edit: p.can_edit,
        }),
      );

      const { data: inserted, error: insertError } = await adminClient
        .from('role_permissions')
        .insert(newPermissions)
        .select();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      return NextResponse.json(inserted as RolePermission[]);
    }

    return NextResponse.json([] as RolePermission[]);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 },
    );
  }
}
