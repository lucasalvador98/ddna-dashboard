import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  canAccessPath,
  findEffectivePermission,
  mergePermissions,
  routeMatches,
} from '@/lib/rbac-types';
import { countCalls, type QueryContext, type QueryResult } from '@/app/api/auth/__tests__/fake-supabase';

const { session, fake } = vi.hoisted(() => ({
  session: { user: null as { id: string; email: string } | null },
  fake: {
    handler: undefined as unknown as (ctx: QueryContext) => QueryResult,
    calls: [] as QueryContext[],
  },
}));

vi.mock('next/headers', () => ({
  cookies: async () => ({ getAll: () => [], set: () => {} }),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      getUser: async () => ({ data: { user: session.user }, error: null }),
    },
  }),
}));

vi.mock('@/lib/supabase', async () => {
  const { createFakeSupabase } = await import('@/app/api/auth/__tests__/fake-supabase');
  const client = createFakeSupabase(fake);
  return { getSupabaseAdminClient: () => client, getSupabaseClient: () => client };
});

beforeEach(() => {
  fake.calls.length = 0;
  fake.handler = () => ({ data: [], error: null });
  session.user = { id: 'user-agente', email: 'agente@ddna.gob.ar' };
});

afterEach(() => {
  vi.resetModules();
});

async function callRoute() {
  vi.resetModules();
  const { GET } = await import('./route');
  return GET();
}

describe('GET /api/auth/me/permissions', () => {
  it('rejects anonymous callers with 401', async () => {
    session.user = null;

    const res = await callRoute();

    expect(res.status).toBe(401);
    expect(countCalls(fake, 'user_roles')).toBe(0);
  });

  it('returns the role base merged with the additive per-user extras', async () => {
    fake.handler = (ctx) => {
      if (ctx.table === 'user_roles') {
        return { data: { role_id: 2, roles: { name: 'agente' } }, error: null };
      }
      if (ctx.table === 'role_permissions') {
        expect(ctx.filters.role_id).toBe(2);
        return {
          data: [
            { route: '/salud', can_view: true, can_edit: false },
            { route: '/monitoreo', can_view: false, can_edit: false },
          ],
          error: null,
        };
      }
      if (ctx.table === 'user_permissions') {
        expect(ctx.filters.user_id).toBe('user-agente');
        return {
          data: [{ route: '/monitoreo', can_view: true, can_edit: false }],
          error: null,
        };
      }
      return { data: null, error: null };
    };

    const res = await callRoute();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.role).toEqual({ id: 2, name: 'agente' });
    expect(body.base_permissions).toHaveLength(2);
    expect(body.extras).toEqual([{ route: '/monitoreo', can_view: true, can_edit: false }]);
    // Extras ADD on top of the role: /monitoreo flips to visible.
    expect(body.effective).toEqual({
      '/salud': { can_view: true, can_edit: false },
      '/monitoreo': { can_view: true, can_edit: false },
    });
    expect(body.warnings).toBeUndefined();
  });

  it('returns only the extras when the user has no role (sin_rol)', async () => {
    fake.handler = (ctx) => {
      if (ctx.table === 'user_roles') return { data: null, error: null };
      if (ctx.table === 'user_permissions') {
        return {
          data: [{ route: '/monitoreo', can_view: true, can_edit: true }],
          error: null,
        };
      }
      return { data: [], error: null };
    };

    const res = await callRoute();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.role).toBeNull();
    expect(body.base_permissions).toEqual([]);
    expect(body.effective).toEqual({ '/monitoreo': { can_view: true, can_edit: true } });
    // No role → no role_permissions lookup
    expect(countCalls(fake, 'role_permissions')).toBe(0);
  });

  it('degrades to the role base with a warning when the extras table cannot be read', async () => {
    fake.handler = (ctx) => {
      if (ctx.table === 'user_roles') {
        return { data: { role_id: 3, roles: [{ name: 'visor' }] }, error: null };
      }
      if (ctx.table === 'role_permissions') {
        return { data: [{ route: '/salud', can_view: true, can_edit: false }], error: null };
      }
      if (ctx.table === 'user_permissions') {
        return { data: null, error: { message: 'relation does not exist' } };
      }
      return { data: null, error: null };
    };

    const res = await callRoute();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.extras).toEqual([]);
    expect(body.effective).toEqual({ '/salud': { can_view: true, can_edit: false } });
    expect(body.warnings?.[0]).toContain('relation does not exist');
  });

  it('returns 500 when the role matrix cannot be read', async () => {
    fake.handler = (ctx) => {
      if (ctx.table === 'user_roles') {
        return { data: { role_id: 1, roles: { name: 'admin' } }, error: null };
      }
      if (ctx.table === 'role_permissions') {
        return { data: null, error: { message: 'boom' } };
      }
      return { data: [], error: null };
    };

    const res = await callRoute();

    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe('boom');
  });
});

describe('mergePermissions', () => {
  it('is additive: an extra can grant but never revoke', () => {
    const base = [
      { route: '/salud', can_view: true, can_edit: false },
      { route: '/monitoreo', can_view: false, can_edit: false },
    ];
    const extras = [
      { route: '/salud', can_view: false, can_edit: true },
      { route: '/monitoreo', can_view: true, can_edit: true },
    ];

    expect(mergePermissions(base, extras)).toEqual({
      '/salud': { can_view: true, can_edit: true },
      '/monitoreo': { can_view: true, can_edit: true },
    });
  });

  it('ignores empty routes and defaults missing flags to false', () => {
    expect(mergePermissions([{ route: '/geo', can_view: true, can_edit: false }], [])).toEqual({
      '/geo': { can_view: true, can_edit: false },
    });
    expect(mergePermissions([], [])).toEqual({});
  });
});

describe('route access helpers', () => {
  it('matches routes by prefix and keeps "/" exact', () => {
    expect(routeMatches('/admin', '/admin')).toBe(true);
    expect(routeMatches('/admin', '/admin/roles')).toBe(true);
    expect(routeMatches('/admin', '/administracion')).toBe(false);
    expect(routeMatches('/', '/')).toBe(true);
    expect(routeMatches('/', '/salud')).toBe(false);
  });

  it('picks the longest matching prefix', () => {
    const effective = {
      '/repositorio': { can_view: false, can_edit: false },
      '/repositorio/chat': { can_view: true, can_edit: false },
    };

    expect(findEffectivePermission(effective, '/repositorio/chat')?.route).toBe('/repositorio/chat');
    expect(findEffectivePermission(effective, '/repositorio')?.route).toBe('/repositorio');
    expect(findEffectivePermission(effective, '/salud')).toBeNull();
  });

  it('denies governed routes without a granted row and allows ungoverned ones', () => {
    const effective = { '/salud': { can_view: false, can_edit: false } };

    expect(canAccessPath(effective, '/salud')).toBe(false);
    expect(canAccessPath(effective, '/monitoreo')).toBe(false);
    expect(canAccessPath(effective, '/apis')).toBe(true);
  });

  it('reserves /admin for the admin role even when the matrix grants it', () => {
    const effective = { '/admin': { can_view: true, can_edit: true } };

    expect(canAccessPath(effective, '/admin', { isAdmin: false })).toBe(false);
    expect(canAccessPath(effective, '/admin/roles', { isAdmin: false })).toBe(false);
    expect(canAccessPath(effective, '/admin', { isAdmin: true })).toBe(true);
    // An admin never loses the way back into the panel, even with no row at all
    expect(canAccessPath({}, '/admin', { isAdmin: true })).toBe(true);
  });
});
