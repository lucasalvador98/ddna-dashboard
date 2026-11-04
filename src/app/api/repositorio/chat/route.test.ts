import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockAdminAuth, mockCreateClient, mockFetchChatCompletion } = vi.hoisted(() => ({
  mockAdminAuth: vi.fn(),
  mockCreateClient: vi.fn(),
  mockFetchChatCompletion: vi.fn(),
}));
vi.mock('@/lib/auth-guard', () => ({ checkAdminAuth: mockAdminAuth }));
vi.mock('@supabase/supabase-js', () => ({ createClient: mockCreateClient }));
vi.mock('@/lib/ai/chat-client', () => ({ fetchChatCompletion: mockFetchChatCompletion }));
vi.mock('@/lib/usage-tracker', () => ({ trackLLMUsage: vi.fn() }));
vi.mock('@/lib/agent/indicator-tools', () => ({
  executeIndicatorTool: vi.fn(),
  extractDataSources: vi.fn(() => []),
  INDICATOR_OPENAPI_TOOLS: [],
  listAvailableIndicators: vi.fn(async () => ({ categorias: [] })),
}));

interface SSEEvent {
  event: string;
  data: Record<string, unknown>;
}

function sseBody(payloads: unknown[]): string {
  return payloads.map(p => `data: ${JSON.stringify(p)}\n\n`).join('') + 'data: [DONE]\n\n';
}

function toolCallResponse(name: string, args: Record<string, unknown>): Response {
  return new Response(
    sseBody([
      {
        choices: [
          {
            delta: {
              tool_calls: [
                {
                  index: 0,
                  id: 'call_1',
                  function: { name, arguments: JSON.stringify(args) },
                },
              ],
            },
          },
        ],
      },
    ]),
    { status: 200, headers: { 'Content-Type': 'text/event-stream' } }
  );
}

function finalTextResponse(text: string): Response {
  return new Response(sseBody([{ choices: [{ delta: { content: text } }] }]), {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

function parseSSE(raw: string): SSEEvent[] {
  return raw
    .split('\n\n')
    .filter(Boolean)
    .flatMap(block => {
      const event = block.match(/^event: (.+)$/m)?.[1];
      const dataLine = block.match(/^data: (.+)$/m)?.[1];
      if (!event || !dataLine) return [];
      return [{ event, data: JSON.parse(dataLine) as Record<string, unknown> }];
    });
}

function createQueryBuilder(result: unknown) {
  const builder: Record<string, unknown> = {};
  for (const method of ['select', 'eq', 'in', 'or', 'limit', 'order', 'textSearch']) {
    builder[method] = () => builder;
  }
  builder.then = (onFulfilled: (value: unknown) => unknown) =>
    Promise.resolve(result).then(onFulfilled);
  return builder;
}

/**
 * Minimal Supabase stub: the FTS query resolves to `ftsResult`, the ILIKE
 * fallback and every other query resolves to an empty result.
 */
function createSupabaseMock(ftsResult: { data: unknown; error: { message: string } | null }) {
  return {
    from(table: string) {
      if (table === 'doc_chunks') {
        let usedIlike = false;
        const builder: Record<string, unknown> = {};
        for (const method of ['select', 'eq', 'in', 'limit', 'textSearch']) {
          builder[method] = () => builder;
        }
        builder.or = () => {
          usedIlike = true;
          return builder;
        };
        builder.then = (onFulfilled: (value: unknown) => unknown) =>
          Promise.resolve(usedIlike ? { data: [], error: null } : ftsResult).then(onFulfilled);
        return builder;
      }
      return createQueryBuilder({ data: [], error: null, count: 0 });
    },
    rpc: async () => ({ data: [], error: null }),
  };
}

async function postChat(question: string): Promise<Response> {
  vi.resetModules();
  const { POST } = await import('./route');
  return POST(
    new Request('http://localhost:3000/api/repositorio/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    })
  );
}

describe('POST /api/repositorio/chat', () => {
  beforeEach(() => {
    mockAdminAuth.mockReset();
    mockAdminAuth.mockResolvedValue({ authorized: true, user: { id: 'test-admin', email: 'admin@example.test' } });
    mockCreateClient.mockReset();
    mockFetchChatCompletion.mockReset();
    vi.stubEnv('OPENAI_API_KEY', 'sk-test-key');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
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

  it('surfaces a warning in the done event when the FTS query errors', async () => {
    mockCreateClient.mockReturnValue(
      createSupabaseMock({ data: null, error: { message: 'fts query failed' } })
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ data: [{ embedding: [0.1, 0.2] }] }), { status: 200 })
      )
    );
    mockFetchChatCompletion
      .mockResolvedValueOnce({
        response: toolCallResponse('searchKnowledgeBase', { query: 'salud adolescente' }),
        modelUsed: 'gpt-test',
      })
      .mockResolvedValueOnce({ response: finalTextResponse('Sin datos.'), modelUsed: 'gpt-test' });

    const res = await postChat('salud adolescente');

    expect(res.status).toBe(200);
    const done = parseSSE(await res.text()).find(e => e.event === 'done');
    expect(done).toBeDefined();
    expect(done!.data.warning).toContain('FTS');
    expect(done!.data.searchMethod).toBe('none');
  });

  it('does not warn when retrieval succeeds but finds nothing', async () => {
    mockCreateClient.mockReturnValue(createSupabaseMock({ data: [], error: null }));
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ data: [{ embedding: [0.1, 0.2] }] }), { status: 200 })
      )
    );
    mockFetchChatCompletion
      .mockResolvedValueOnce({
        response: toolCallResponse('searchKnowledgeBase', { query: 'salud adolescente' }),
        modelUsed: 'gpt-test',
      })
      .mockResolvedValueOnce({ response: finalTextResponse('Sin datos.'), modelUsed: 'gpt-test' });

    const res = await postChat('salud adolescente');

    expect(res.status).toBe(200);
    const done = parseSSE(await res.text()).find(e => e.event === 'done');
    expect(done).toBeDefined();
    expect(done!.data.warning).toBeUndefined();
    expect(done!.data.searchMethod).toBe('none');
  });

});
