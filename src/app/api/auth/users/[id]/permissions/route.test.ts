import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { countCalls, type QueryContext, type QueryResult } from '@/app/api/auth/__tests__/fake-supabase';

const { fake, mockCheckAdminAuth } = vi.hoisted(() => ({
  fake: {
    handler: undefined as unknown as (ctx: QueryContext) => QueryResult,
    calls: [] as QueryContext[],
  },
  mockCheckAdminAuth: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: async () => ({ getAll: () => [], set: () => {} }),
}));

// Keep the real resolvePermissions (it is the code under test here) and only
// replace the admin guard.
vi.mock('@/lib/auth-guard', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth-guard')>();
  return { ...actual, checkAdminAuth: mockCheckAdminAuth };
});

vi.mock('@/lib/supabase', async () => {
  const { createFakeSupabase } = await import('@/app/api/auth/__tests__/fake-supabase');
  const client = createFakeSupabase(fake);
  return { getSupabaseAdminClient: () => client, getSupabaseClient: () => client };
});

const params = (id: string) => ({ params: Promise.resolve({ id }) });
const request = (body: unknown) =>
  ({ json: async () => body }) as unknown as Parameters<typeof import('./route').PUT>[0];

beforeEach(() => {
  fake.calls.length = 0;
  fake.handler = () => ({ data: null, error: null });
  mockCheckAdminAuth.mockResolvedValue({
    authorized: true,
    user: { id: 'admin-1', email: 'admin@ddna.gob.ar' },
  });
});

describe('GET /api/auth/users/[id]/permissions', () => {
  it('keeps the endpoint admin-only', async () => {
    mockCheckAdminAuth.mockResolvedValue({
      authorized: false,
      response: NextResponse.json({ error: 'Se requiere rol de administrador' }, { status: 403 }),
    });

    const { GET } = await import('./route');
    const res = await GET({} as never, params('u-9'));

    expect(res.status).toBe(403);
    expect(fake.calls).toHaveLength(0);
  });

  it('returns 404 for an unknown user', async () => {
    fake.handler = (ctx) => {
      if (ctx.table === 'auth.users') return { data: { user: null }, error: null };
      return { data: null, error: null };
    };

    const { GET } = await import('./route');
    const res = await GET({} as never, params('missing'));

    expect(res.status).toBe(404);
    expect(countCalls(fake, 'user_permissions')).toBe(0);
  });

  it('returns role base, extras and the merged effective map', async () => {
    fake.handler = (ctx) => {
      if (ctx.table === 'auth.users') {
        return { data: { user: { id: 'u-9', email: 'agente@ddna.gob.ar' } }, error: null };
      }
      if (ctx.table === 'user_roles') {
        return { data: { role_id: 3, roles: { name: 'visor' } }, error: null };
      }
      if (ctx.table === 'role_permissions') {
        return { data: [{ route: '/salud', can_view: true, can_edit: false }], error: null };
      }
      if (ctx.table === 'user_permissions') {
        return { data: [{ route: '/monitoreo', can_view: true, can_edit: false }], error: null };
      }
      return { data: null, error: null };
    };

    const { GET } = await import('./route');
    const res = await GET({} as never, params('u-9'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.user_id).toBe('u-9');
    expect(body.role).toEqual({ id: 3, name: 'visor' });
    expect(body.extras).toEqual([{ route: '/monitoreo', can_view: true, can_edit: false }]);
    expect(body.effective).toEqual({
      '/salud': { can_view: true, can_edit: false },
      '/monitoreo': { can_view: true, can_edit: false },
    });
  });
});

describe('PUT /api/auth/users/[id]/permissions', () => {
  const existingUser = (ctx: QueryContext): QueryResult | null =>
    ctx.table === 'auth.users'
      ? { data: { user: { id: 'u-9', email: 'visor@ddna.gob.ar' } }, error: null }
      : null;

  it('rejects a malformed payload', async () => {
    fake.handler = (ctx) => existingUser(ctx) ?? { data: null, error: null };

    const { PUT } = await import('./route');
    const res = await PUT(request({ permissions: 'nope' }), params('u-9'));

    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain('permissions');
    expect(countCalls(fake, 'user_permissions', 'delete')).toBe(0);
  });

  it('rejects rows without boolean flags', async () => {
    fake.handler = (ctx) => existingUser(ctx) ?? { data: null, error: null };

    const { PUT } = await import('./route');
    const res = await PUT(
      request({ permissions: [{ route: '/monitoreo', can_view: 'yes', can_edit: false }] }),
      params('u-9'),
    );

    expect(res.status).toBe(400);
  });

  it('replaces the extras: deletes first, then inserts the granted rows', async () => {
    fake.handler = (ctx) => {
      const user = existingUser(ctx);
      if (user) return user;
      if (ctx.table === 'user_permissions' && ctx.op === 'delete') {
        return { data: null, error: null };
      }
      if (ctx.table === 'user_permissions' && ctx.op === 'insert') {
        return { data: ctx.payload, error: null };
      }
      return { data: null, error: null };
    };

    const { PUT } = await import('./route');
    const res = await PUT(
      request({
        permissions: [
          { route: '/monitoreo', can_view: true, can_edit: false },
          // edit without view is normalized to view+edit
          { route: '/repositorio', can_view: false, can_edit: true },
        ],
      }),
      params('u-9'),
    );

    expect(res.status).toBe(200);

    const deletions = fake.calls.filter(
      (call) => call.table === 'user_permissions' && call.op === 'delete',
    );
    expect(deletions).toHaveLength(1);
    expect(deletions[0].filters.user_id).toBe('u-9');

    const inserts = fake.calls.filter(
      (call) => call.table === 'user_permissions' && call.op === 'insert',
    );
    expect(inserts).toHaveLength(1);
    expect(inserts[0].payload).toEqual([
      { user_id: 'u-9', route: '/monitoreo', can_view: true, can_edit: false },
      { user_id: 'u-9', route: '/repositorio', can_view: true, can_edit: true },
    ]);
  });

  it('clears the extras when the payload is empty', async () => {
    fake.handler = (ctx) => existingUser(ctx) ?? { data: null, error: null };

    const { PUT } = await import('./route');
    const res = await PUT(request({ permissions: [] }), params('u-9'));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
    expect(countCalls(fake, 'user_permissions', 'delete')).toBe(1);
    expect(countCalls(fake, 'user_permissions', 'insert')).toBe(0);
  });

  it('returns 404 for an unknown user', async () => {
    fake.handler = (ctx) =>
      ctx.table === 'auth.users'
        ? { data: { user: null }, error: null }
        : { data: null, error: null };

    const { PUT } = await import('./route');
    const res = await PUT(request({ permissions: [] }), params('missing'));

    expect(res.status).toBe(404);
    expect(countCalls(fake, 'user_permissions', 'delete')).toBe(0);
  });
});
