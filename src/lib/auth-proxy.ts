import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { sanitizeRedirectUrl } from '@/lib/redirect';
import { getAuthSettings } from '@/lib/auth-settings';
import { dashboardPath } from '@/lib/app-path';
import {
  canAccessPath,
  mergePermissions,
  type EffectivePermissions,
} from '@/lib/rbac-types';

// ─── Auth Proxy ───────────────────────────────────────────────────────────────
//
// Two checks for a protected route, in order:
//   1. session   → no session: redirect to /login (pre-existing behavior)
//   2. permission → the merged RBAC matrix (role base ∪ per-user extras) must
//      grant can_view; otherwise the request is denied with a 403 page, so
//      hiding a screen is not cosmetic (S3).
//
// The permission read uses the service_role key through the Data API instead
// of @supabase/supabase-js: the proxy runs on every navigation and only needs
// three small reads (user_roles, role_permissions, user_permissions).

interface PermissionRow {
  route: string;
  can_view: boolean;
  can_edit: boolean;
}

interface RoleRow {
  role_id: number | null;
  roles: { name: string } | { name: string }[] | null;
}

/** Read a PostgREST path with the service key. null = could not be resolved. */
async function fetchRbacRows<T>(path: string): Promise<T[] | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const rows = (await res.json()) as T[];

    return Array.isArray(rows) ? rows : null;
  } catch {
    return null;
  }
}

/**
 * Resolve a user's role + merged permissions. Returns null when the RBAC data
 * cannot be read (missing env, PostgREST down, cold start): the caller then
 * keeps the session-only behavior instead of denying every screen, and the
 * page-level LoginGate remains the gate.
 */
export async function resolveProxyPermissions(
  userId: string,
): Promise<{ roleName: string | null; effective: EffectivePermissions } | null> {
  // The role lookup and the per-user extras are independent: fetch together.
  const [roleRows, extrasRows] = await Promise.all([
    fetchRbacRows<RoleRow>(
      `user_roles?user_id=eq.${encodeURIComponent(userId)}&select=${encodeURIComponent('role_id,roles(name)')}`,
    ),
    // Extras are additive; a read failure degrades to the role base instead of
    // denying the whole screen.
    fetchRbacRows<PermissionRow>(
      `user_permissions?user_id=eq.${encodeURIComponent(userId)}&select=${encodeURIComponent('route,can_view,can_edit')}`,
    ),
  ]);

  if (!roleRows) return null;

  const roleRow = roleRows[0] ?? null;
  const roleId = typeof roleRow?.role_id === 'number' ? roleRow.role_id : null;
  const embeddedRole = Array.isArray(roleRow?.roles) ? roleRow?.roles[0] : roleRow?.roles;
  const roleName = embeddedRole?.name ?? null;

  let base: PermissionRow[] = [];

  if (roleId !== null) {
    const baseRows = await fetchRbacRows<PermissionRow>(
      `role_permissions?role_id=eq.${roleId}&select=${encodeURIComponent('route,can_view,can_edit')}`,
    );

    if (!baseRows) return null;

    base = baseRows;
  }

  return {
    roleName,
    effective: mergePermissions(base, extrasRows ?? []),
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Denied page for an authenticated user without permission. A response (not a
 * redirect) on purpose: redirecting to / could loop when the home route itself
 * is the denied one.
 */
function deniedResponse(pathname: string): NextResponse {
  const home = dashboardPath('/');

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Sin acceso — DDNA</title>
</head>
<body style="margin:0;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;background:#f9fafb;color:#0b0b0c;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px">
<main style="max-width:30rem;text-align:center">
<div style="width:64px;height:64px;border-radius:16px;background:#fef3c7;display:flex;align-items:center;justify-content:center;margin:0 auto 16px" aria-hidden="true">🔒</div>
<h1 style="font-size:20px;margin:0 0 8px">Sin acceso</h1>
<p style="font-size:14px;color:#6b7280;margin:0 0 4px">Tu rol no tiene permiso para ver <code>${escapeHtml(pathname)}</code>.</p>
<p style="font-size:14px;color:#9ca3af;margin:0 0 24px">Contactá al administrador si necesitás acceso.</p>
<a href="${home}" style="display:inline-block;padding:12px 24px;background:#0b0b0c;color:#fff;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px">Volver al inicio</a>
</main>
</body>
</html>`;

  return new NextResponse(html, {
    status: 403,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export async function authProxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next')
  ) {
    return NextResponse.next();
  }

  const settings = await getAuthSettings();

  if (!settings.enabled) {
    return NextResponse.next();
  }

  const isProtected = settings.protected_routes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // ─── Session check ────────────────────────────────────────────────────────

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    const loginUrl = new URL(dashboardPath('/login'), request.url);
    const originalPath = pathname + (searchParams.size > 0 ? `?${searchParams}` : '');
    loginUrl.searchParams.set('redirect', sanitizeRedirectUrl(originalPath, '/'));
    return NextResponse.redirect(loginUrl);
  }

  // ─── Permission check (RBAC) ──────────────────────────────────────────────

  const permissions = await resolveProxyPermissions(data.user.id);

  if (
    permissions &&
    !canAccessPath(permissions.effective, pathname, {
      isAdmin: permissions.roleName === 'admin',
    })
  ) {
    return deniedResponse(pathname);
  }

  return supabaseResponse;
}
