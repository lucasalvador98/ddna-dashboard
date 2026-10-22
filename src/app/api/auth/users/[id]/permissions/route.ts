import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { checkAdminAuth, resolvePermissions } from '@/lib/auth-guard';
import type { PermissionsPayload } from '@/lib/rbac-types';

/**
 * GET /api/auth/users/[id]/permissions — admin view of one user's matrix
 * PUT /api/auth/users/[id]/permissions — replace that user's per-user extras
 *
 * The extras (public.user_permissions) are ADDITIONS on top of the role base:
 * they grant screens the role does not have and never revoke. The PUT payload
 * therefore only needs the granted rows; anything absent is deleted.
 */

interface ExtraInput {
  route: string;
  can_view: boolean;
  can_edit: boolean;
}

/** Normalize a validation error into `null` when the payload is usable. */
function parseExtras(payload: unknown): ExtraInput[] | null {
  if (!Array.isArray(payload)) return null;

  const parsed: ExtraInput[] = [];

  for (const entry of payload) {
    if (
      !entry ||
      typeof entry !== 'object' ||
      typeof (entry as Record<string, unknown>).route !== 'string' ||
      ((entry as Record<string, unknown>).route as string).trim().length === 0 ||
      typeof (entry as Record<string, unknown>).can_view !== 'boolean' ||
      typeof (entry as Record<string, unknown>).can_edit !== 'boolean'
    ) {
      return null;
    }

    const row = entry as ExtraInput;
    // An "edit" grant is meaningless without view; normalize it on write.
    parsed.push({
      route: row.route.trim(),
      can_view: row.can_view || row.can_edit,
      can_edit: row.can_edit,
    });
  }

  return parsed;
}

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

    const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(id);

    if (authError || !authUser?.user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const payload: PermissionsPayload = await resolvePermissions(id);

    return NextResponse.json(payload);
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

    const body = (await request.json()) as { permissions?: unknown };
    const extras = parseExtras(body.permissions);

    if (extras === null) {
      return NextResponse.json(
        {
          error:
            'Se requiere un array "permissions" con { route (string), can_view (boolean), can_edit (boolean) }',
        },
        { status: 400 },
      );
    }

    const adminClient = getSupabaseClient();

    const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(id);

    if (authError || !authUser?.user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Replace-all, same contract as PUT /api/auth/roles/[id]/permissions.
    const { error: deleteError } = await adminClient
      .from('user_permissions')
      .delete()
      .eq('user_id', id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    if (extras.length === 0) {
      return NextResponse.json([] as ExtraInput[]);
    }

    const { data: inserted, error: insertError } = await adminClient
      .from('user_permissions')
      .insert(extras.map((row) => ({ user_id: id, ...row })))
      .select('user_id, route, can_view, can_edit');

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(inserted as ExtraInput[]);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 },
    );
  }
}
