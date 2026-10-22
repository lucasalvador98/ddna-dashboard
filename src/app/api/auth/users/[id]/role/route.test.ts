import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { countCalls, type QueryContext, type QueryResult } from '@/app/api/auth/__tests__/fake-supabase';

const { session, fake, mockCheckAuth, mockCheckAdminAuth } = vi.hoisted(() => ({
  session: { user: { id: 'admin-1', email: 'admin@ddna.gob.ar' } as { id: string } | null },
  fake: {
    handler: undefined as unknown as (ctx: QueryContext) => QueryResult,
    calls: [] as QueryContext[],
  },
  mockCheckAuth: vi.fn(),
  mockCheckAdminAuth: vi.fn(),
}));

vi.mock('@/lib/auth-guard', () => ({
  checkAuth: mockCheckAuth,
  checkAdminAuth: mockCheckAdminAuth,
}));

vi.mock('@/lib/supabase', async () => {
  const { createFakeSupabase } = await import('@/app/api/auth/__tests__/fake-supabase');
  const client = createFakeSupabase(fake);
  return { getSupabaseAdminClient: () => client, getSupabaseClient: () => client };
});

function putRequest(body: unknown) {
  return {
    json: async () => body,
  } as unknown as Parameters<typeof import('./route').PUT>[0];
}

const params = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  fake.calls.length = 0;
  fake.handler = () => ({ data: null, error: null });
  mockCheckAuth.mockResolvedValue({ authorized: true, user: session.user });
  mockCheckAdminAuth.mockResolvedValue({ authorized: true, user: session.user });
});

describe('PUT /api/auth/users/[id]/role', () => {
  it('accepts role_id: null and removes the assignment', async () => {
    fake.handler = (ctx) => {
      if (ctx.table === 'user_roles' && ctx.op === 'select') {
        return { data: { role_id: 2, roles: { name: 'agente' } }, error: null };
      }
      if (ctx.table === 'user_roles' && ctx.op === 'delete') {
        return { data: null, error: null };
      }
      if (ctx.table === 'auth.users') {
        return { data: { user: { id: 'u-9', email: 'juan@prensa.com' } }, error: null };
      }
      return { data: null, error: null };
    };

    const { PUT } = await import('./route');
    const res = await PUT(putRequest({ role_id: null }), params('u-9'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      user_id: 'u-9',
      email: 'juan@prensa.com',
      role_id: 0,
      role_name: 'sin_rol',
      created_at: '',
    });

    const deletions = fake.calls.filter((call) => call.table === 'user_roles' && call.op === 'delete');
    expect(deletions).toHaveLength(1);
    expect(deletions[0].filters.user_id).toBe('u-9');
    expect(countCalls(fake, 'user_roles', 'upsert')).toBe(0);
  });

  it('is 404-safe: removing a role that is not there still succeeds', async () => {
    fake.handler = (ctx) => {
      if (ctx.table === 'auth.users') {
        return { data: { user: { id: 'u-9', email: 'juan@prensa.com' } }, error: null };
      }
      return { data: null, error: null };
    };

    const { PUT } = await import('./route');
    const res = await PUT(putRequest({ role_id: null }), params('u-9'));

    expect(res.status).toBe(200);
    expect((await res.json()).role_name).toBe('sin_rol');
  });

  it('refuses to remove the role of the last admin', async () => {
    fake.handler = (ctx) => {
      if (ctx.table === 'user_roles' && ctx.op === 'select' && ctx.options?.head) {
        return { data: null, error: null, count: 1 };
      }
      if (ctx.table === 'user_roles' && ctx.op === 'select') {
        return { data: { role_id: 1, roles: { name: 'admin' } }, error: null };
      }
      return { data: null, error: null };
    };

    const { PUT } = await import('./route');
    const res = await PUT(putRequest({ role_id: null }), params('admin-1'));

    expect(res.status).toBe(403);
    expect((await res.json()).error).toContain('último admin');
    expect(countCalls(fake, 'user_roles', 'delete')).toBe(0);
  });

  it('rejects an unknown role_id with 400 and writes nothing', async () => {
    fake.handler = (ctx) => {
      if (ctx.table === 'user_roles' && ctx.op === 'select') {
        return { data: { role_id: 2, roles: { name: 'agente' } }, error: null };
      }
      if (ctx.table === 'roles') return { data: null, error: null };
      return { data: null, error: null };
    };

    const { PUT } = await import('./route');
    const res = await PUT(putRequest({ role_id: 99 }), params('u-9'));

    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('El rol indicado no existe');
    expect(countCalls(fake, 'user_roles', 'upsert')).toBe(0);
  });

  it('rejects a missing role_id', async () => {
    const { PUT } = await import('./route');
    const res = await PUT(putRequest({}), params('u-9'));

    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain('role_id');
  });

  it('assigns a role when role_id is a number', async () => {
    fake.handler = (ctx) => {
      if (ctx.table === 'user_roles' && ctx.op === 'select') {
        return { data: null, error: null };
      }
      if (ctx.table === 'roles') return { data: { name: 'agente' }, error: null };
      if (ctx.table === 'user_roles' && ctx.op === 'upsert') {
        return {
          data: {
            user_id: 'u-9',
            role_id: 2,
            created_at: '2026-10-21T00:00:00Z',
            roles: { name: 'agente' },
          },
          error: null,
        };
      }
      if (ctx.table === 'auth.users') {
        return { data: { user: { id: 'u-9', email: 'agente@ddna.gob.ar' } }, error: null };
      }
      return { data: null, error: null };
    };

    const { PUT } = await import('./route');
    const res = await PUT(putRequest({ role_id: 2 }), params('u-9'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.role_name).toBe('agente');
    const upserts = fake.calls.filter((call) => call.table === 'user_roles' && call.op === 'upsert');
    expect(upserts).toHaveLength(1);
    expect(upserts[0].payload).toEqual({ user_id: 'u-9', role_id: 2 });
  });

  it('keeps the admin-only guard', async () => {
    mockCheckAdminAuth.mockResolvedValue({
      authorized: false,
      response: NextResponse.json({ error: 'Se requiere rol de administrador' }, { status: 403 }),
    });

    const { PUT } = await import('./route');
    const res = await PUT(putRequest({ role_id: null }), params('u-9'));

    expect(res.status).toBe(403);
    expect(fake.calls).toHaveLength(0);
  });
});
