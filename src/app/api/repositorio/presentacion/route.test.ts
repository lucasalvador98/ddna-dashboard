import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mock admin auth guard ──────────────────────────────────────
const { mockAdminAuth } = vi.hoisted(() => ({ mockAdminAuth: vi.fn() }));
vi.mock('@/lib/auth-guard', () => ({ checkAdminAuth: mockAdminAuth }));

// Env vars the route reads at module scope.
vi.stubEnv('OPENAI_API_KEY', 'sk-test-key');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

const validBody = {
  kpi_nombres: [],
  grupos: [],
  context: {},
};

function makeRequest() {
  return new Request('http://localhost:3000/api/repositorio/presentacion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validBody),
  });
}

describe('POST /api/repositorio/presentacion', () => {
  beforeEach(() => {
    mockAdminAuth.mockReset();
    mockAdminAuth.mockResolvedValue({
      authorized: true,
      user: { id: 'test-admin', email: 'admin@example.test' },
    });
    vi.stubEnv('OPENAI_API_KEY', 'sk-test-key');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 when the admin guard denies the request', async () => {
    const { NextResponse } = await import('next/server');
    mockAdminAuth.mockResolvedValueOnce({
      authorized: false,
      response: NextResponse.json({ error: 'No autenticado' }, { status: 401 }),
    });
    vi.resetModules();
    const { POST } = await import('./route');

    const res = await POST(makeRequest());
    expect(res.status).toBe(401);
    expect(mockAdminAuth).toHaveBeenCalledOnce();
  });

  it('denies before spending LLM tokens (fetch never called)', async () => {
    const { NextResponse } = await import('next/server');
    mockAdminAuth.mockResolvedValueOnce({
      authorized: false,
      response: NextResponse.json({ error: 'No autenticado' }, { status: 401 }),
    });
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.resetModules();
    const { POST } = await import('./route');

    const res = await POST(makeRequest());
    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
