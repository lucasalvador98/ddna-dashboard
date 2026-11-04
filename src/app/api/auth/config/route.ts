import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth-guard';
import { getAuthSettings } from '@/lib/auth-settings';

/**
 * GET /api/auth/config
 *
 * Returns the shared auth settings ({ enabled, protected_routes }) read from
 * the settings table (key=auth) through the cached service-role module.
 * Any authenticated user may read it — the client gate needs the enabled
 * flag and the protected route list; it is not sensitive.
 */
export async function GET() {
  // ── Auth: any authenticated user ─────────────────────────────────────────
  const guard = await checkAuth();
  if (!guard.authorized) return guard.response!;

  try {
    const settings = await getAuthSettings();

    // Explicit shape: `degraded` is a server-side protection signal and must
    // not reach the browser payload.
    return NextResponse.json({
      enabled: settings.enabled,
      protected_routes: settings.protected_routes,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Error al cargar la configuración de autenticación' },
      { status: 500 }
    );
  }
}