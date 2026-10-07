import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockAdminAuth } = vi.hoisted(() => ({ mockAdminAuth: vi.fn() }));
vi.mock('@/lib/auth-guard', () => ({ checkAdminAuth: mockAdminAuth }));

describe('POST /api/repositorio/chat', () => {
  beforeEach(() => {
    mockAdminAuth.mockReset();
    mockAdminAuth.mockResolvedValue({ authorized: true, user: { id: 'test-admin', email: 'admin@example.test' } });
    vi.stubEnv('OPENAI_API_KEY', 'sk-test-key');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('returns 400 when question is missing', async () => {
    vi.resetModules();
    const { POST } = await import('./route');

    const req = new Request('http://localhost:3000/api/repositorio/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data).toEqual({ error: "La pregunta es requerida (campo 'question')" });
  });

  it('returns 400 when question is not a string', async () => {
    vi.resetModules();
    const { POST } = await import('./route');

    const req = new Request('http://localhost:3000/api/repositorio/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: true }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 500 when OPENAI_API_KEY is not set', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.resetModules();
    const { POST } = await import('./route');

    const req = new Request('http://localhost:3000/api/repositorio/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'test' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.error).toContain('OPENAI_API_KEY');
  });
  it('preserves the admin guard before validating the request', async () => {
    const { NextResponse } = await import('next/server');
    mockAdminAuth.mockResolvedValueOnce({ authorized: false, response: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) });
    vi.resetModules();
    const { POST } = await import('./route');
    const res = await POST(new Request('http://localhost:3000/api/repositorio/chat', { method: 'POST', body: '{}' }));
    expect(res.status).toBe(401);
    expect(mockAdminAuth).toHaveBeenCalledOnce();
  });

});
