import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('POST /api/repositorio/chat', () => {
  beforeEach(() => {
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
});
