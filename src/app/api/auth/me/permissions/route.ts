import { NextResponse } from 'next/server';
import { checkAuth, resolvePermissions } from '@/lib/auth-guard';

/**
 * GET /api/auth/me/permissions — the caller's own permission matrix.
 *
 * Any authenticated user may read it (that is the point: the sidebar and the
 * LoginGate resolve screens for non-admin users, while /api/auth/roles stays
 * admin-only). Shape:
 *
 *   { user_id, role: { id, name } | null,
 *     base_permissions: [...role_permissions rows],
 *     extras: [...user_permissions rows],
 *     effective: { [route]: { can_view, can_edit } } }
 *
 * `effective` is the additive merge of the role base and the per-user extras.
 */
export async function GET() {
  try {
    const guard = await checkAuth();
    if (!guard.authorized) return guard.response!;

    const payload = await resolvePermissions(guard.user!.id);

    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
