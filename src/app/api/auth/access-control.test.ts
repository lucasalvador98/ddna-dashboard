import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * Server-side access control of the auth proxy (T6): a protected route is
 * denied from the RBAC matrix, not only hidden in the sidebar.
 *
 * This file lives next to the auth API because the existing
 * src/lib/auth-proxy.test.ts is outside the edit surface of this change; that
 * file keeps covering the session/redirect behavior and this one adds the
 * permission cases.
 */

const { session, settings } = vi.hoisted(() => ({
  session: { user: null as { id: string } | null },
  settings: { value: { enabled: true, protected_routes: ['/admin', '/monitoreo'] } },
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: session.user } }) },
  }),
}));

vi.mock('@/lib/auth-settings', () => ({
  getAuthSettings: async () => settings.value,
}));

interface RbacFixture {
  role?: unknown;
  base?: Array<{ route: string; can_view: boolean; can_edit: boolean }>;
  extras?: Array<{ route: string; can_view: boolean; can_edit: boolean }>;
  fail?: boolean;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function mockRbacFetch(fixture: RbacFixture) {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : String(input);

    if (fixture.fail) return jsonResponse({ message: 'boom' }, 500);
    if (url.includes('/rest/v1/user_roles')) {
      return jsonResponse(fixture.role === undefined ? [] : [fixture.role]);
    }
    if (url.includes('/rest/v1/role_permissions')) return jsonResponse(fixture.base ?? []);
    if (url.includes('/rest/v1/user_permissions')) return jsonResponse(fixture.extras ?? []);
    return jsonResponse([]);
  });
}

function protectedRequest(path: string) {
  return new NextRequest(`http://localhost/observatorio${path}`, {
    nextConfig: { basePath: '/observatorio' },
  });
}

beforeEach(() => {
  session.user = { id: 'user-1' };
  settings.value = { enabled: true, protected_routes: ['/admin', '/monitoreo'] };
  vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/observatorio');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://unit.invalid');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'unit-service-placeholder');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

async function runProxy(path: string) {
  const { authProxy } = await import('@/lib/auth-proxy');
  return authProxy(protectedRequest(path));
}

describe('auth proxy permission enforcement', () => {
  it('allows a protected route the role matrix grants', async () => {
    mockRbacFetch({
      role: { role_id: 2, roles: { name: 'agente' } },
      base: [{ route: '/monitoreo', can_view: true, can_edit: false }],
    });

    const res = await runProxy('/monitoreo');

    expect(res.status).toBe(200);
    expect(res.headers.get('x-middleware-next')).toBe('1');
    expect(res.headers.get('location')).toBeNull();
  });

  it('denies a protected route the role matrix hides', async () => {
    mockRbacFetch({
      role: { role_id: 3, roles: [{ name: 'visor' }] },
      base: [{ route: '/monitoreo', can_view: false, can_edit: false }],
    });

    const res = await runProxy('/monitoreo');

    expect(res.status).toBe(403);
    const body = await res.text();
    expect(body).toContain('Sin acceso');
    expect(body).toContain('/monitoreo');
    expect(res.headers.get('x-middleware-next')).toBeNull();
  });

  it('denies a governed route with no row at all for the role', async () => {
    mockRbacFetch({
      role: { role_id: 3, roles: { name: 'visor' } },
      base: [{ route: '/salud', can_view: true, can_edit: false }],
    });

    const res = await runProxy('/monitoreo');

    expect(res.status).toBe(403);
  });

  it('lets a per-user extra grant a screen the role matrix does not have', async () => {
    mockRbacFetch({
      role: { role_id: 3, roles: { name: 'visor' } },
      base: [{ route: '/salud', can_view: true, can_edit: false }],
      extras: [{ route: '/monitoreo', can_view: true, can_edit: false }],
    });

    const res = await runProxy('/monitoreo');

    expect(res.headers.get('x-middleware-next')).toBe('1');
  });

  it('denies /admin to a non-admin even when the matrix grants it', async () => {
    mockRbacFetch({
      role: { role_id: 2, roles: { name: 'agente' } },
      base: [{ route: '/admin', can_view: true, can_edit: true }],
    });

    const res = await runProxy('/admin/roles');

    expect(res.status).toBe(403);
  });

  it('allows /admin for the admin role', async () => {
    mockRbacFetch({
      role: { role_id: 1, roles: { name: 'admin' } },
      base: [{ route: '/admin', can_view: true, can_edit: true }],
    });

    const res = await runProxy('/admin');

    expect(res.headers.get('x-middleware-next')).toBe('1');
  });

  it('keeps today\'s behavior for a protected path outside the matrix', async () => {
    settings.value = { enabled: true, protected_routes: ['/apis'] };
    mockRbacFetch({
      role: { role_id: 3, roles: { name: 'visor' } },
      base: [],
    });

    const res = await runProxy('/apis');

    expect(res.headers.get('x-middleware-next')).toBe('1');
  });

  it('falls back to the session check when the RBAC data cannot be read', async () => {
    mockRbacFetch({ fail: true });

    const res = await runProxy('/monitoreo');

    expect(res.headers.get('x-middleware-next')).toBe('1');
  });

  it('renders the denied pathname escaped', async () => {
    mockRbacFetch({
      role: { role_id: 3, roles: { name: 'visor' } },
      base: [{ route: '/monitoreo', can_view: false, can_edit: false }],
    });

    const res = await runProxy('/monitoreo/%3Cimg%20src=x%20onerror=alert(1)%3E');

    expect(res.status).toBe(403);
    expect(await res.text()).not.toContain('<img');
  });

  it('keeps public mode: auth disabled never checks permissions', async () => {
    settings.value = { enabled: false, protected_routes: ['/monitoreo'] };
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const res = await runProxy('/monitoreo');

    expect(res.headers.get('x-middleware-next')).toBe('1');
    const rbacCalls = fetchSpy.mock.calls.filter(([input]) =>
      String(input).includes('/rest/v1/'),
    );
    expect(rbacCalls).toHaveLength(0);
  });
});
