import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mock Supabase ──────────────────────────────────────────────
let mockSupabaseData: unknown[] = [];
let mockSupabaseError: unknown = null;

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => {
    function chain(data: unknown[], error: unknown) {
      const end = () => Promise.resolve({ data, error });
      return {
        eq: () => chain(data, error),
        in: () => chain(data, error),
        order: end,
        limit: end,
      };
    }
    return {
      from: () => ({
        select: () => chain(mockSupabaseData, mockSupabaseError),
      }),
    };
  },
}));

// ─── Mock OpenAI response ───────────────────────────────────────

const mockOpenAIResponse = {
  id: 'chat-123',
  choices: [
    {
      message: {
        role: 'assistant',
        content: JSON.stringify({
          title: 'Informe Ejecutivo de Indicadores de NNyA - Córdoba',
          date: '04/06/2026',
          overview:
            'El análisis de los indicadores correspondientes a salud y educación muestra tendencias mixtas...',
          sections: [
            {
              category: 'salud',
              title: 'Análisis de Salud',
              analysis: 'La mortalidad infantil en Córdoba se reduvo...',
              highlights: [
                {
                  type: 'positive' as const,
                  text: 'La TMI de Córdoba se redujo de 9.1 a 8.5 por mil nacidos vivos.',
                },
              ],
            },
          ],
          dataQuality: [
            {
              category: 'salud',
              rating: 'alta',
              issues: ['Datos actualizados hasta 2022'],
            },
          ],
          discrepancies: [],
          crossReferences: [],
          suggestedImprovements: ['Mejorar frecuencia de actualización'],
          conclusion: 'En conclusión, se observan avances en salud...',
          recommendations: [
            'Fortalecer las políticas de salud infantil.',
          ],
        }),
      },
    },
  ],
};

function createMockFetch(
  ok: boolean,
  data: unknown,
  status = 200,
) {
  return vi.fn().mockResolvedValue({
    ok,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
    status,
  });
}

describe('POST /api/repositorio/informe-ejecutivo', () => {
  beforeEach(() => {
    vi.stubEnv('OPENAI_API_KEY', 'sk-test-key');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
    mockSupabaseData = [];
    mockSupabaseError = null;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('returns 400 when axes is not an array', async () => {
    vi.resetModules();
    vi.stubGlobal('fetch', undefined);
    const { POST } = await import('./route');

    const req = new Request(
      'http://localhost:3000/api/repositorio/informe-ejecutivo',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ axes: 'salud' }),
      },
    );

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain('axes');
  });

  it('returns 400 when body is not valid JSON', async () => {
    vi.resetModules();
    vi.stubGlobal('fetch', undefined);
    const { POST } = await import('./route');

    const req = new Request(
      'http://localhost:3000/api/repositorio/informe-ejecutivo',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not-json',
      },
    );

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 500 when OPENAI_API_KEY is not configured', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.resetModules();
    vi.stubGlobal('fetch', undefined);
    const { POST } = await import('./route');

    const req = new Request(
      'http://localhost:3000/api/repositorio/informe-ejecutivo',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      },
    );

    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain('OPENAI_API_KEY');
  });

  it('returns 200 with report for valid axes', async () => {
    mockSupabaseData = [
      {
        id: '1',
        titulo: 'Mortalidad infantil (TMI Cba)',
        categoria_db: 'salud',
        contenido: 'salud | Mortalidad infantil (TMI Cba) | valor: 8.5 ‰ | período: 2022 | región: Córdoba',
        fuente: 'DEIS',
        periodo: '2022',
        ejes_relacionados: null,
      },
      {
        id: '2',
        titulo: 'Mortalidad infantil (TMI Cba)',
        categoria_db: 'salud',
        contenido: 'salud | Mortalidad infantil (TMI Cba) | valor: 9.1 ‰ | período: 2021 | región: Córdoba',
        fuente: 'DEIS',
        periodo: '2021',
        ejes_relacionados: null,
      },
    ];

    vi.resetModules();
    vi.stubGlobal('fetch', createMockFetch(true, mockOpenAIResponse));
    const { POST } = await import('./route');

    const req = new Request(
      'http://localhost:3000/api/repositorio/informe-ejecutivo',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ axes: ['salud'] }),
      },
    );

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.report).toBeDefined();
    expect(data.report.title).toBe(
      'Informe Ejecutivo de Indicadores de NNyA - Córdoba',
    );
    expect(data.report.sections).toHaveLength(1);
    expect(data.report.sections[0].category).toBe('salud');
    expect(data.report.sections[0].highlights[0].type).toBe('positive');
    expect(data.generatedAt).toBeDefined();
  });

  it('returns 200 with all axes when axes is empty', async () => {
    mockSupabaseData = [
      {
        id: '1',
        titulo: 'Pobreza personas',
        categoria_db: 'pobreza',
        contenido: 'pobreza | Pobreza personas | valor: 38.5 % | período: 2024 | región: Córdoba',
        fuente: 'INDEC',
        periodo: '2024',
        ejes_relacionados: null,
      },
    ];

    vi.resetModules();
    vi.stubGlobal('fetch', createMockFetch(true, mockOpenAIResponse));
    const { POST } = await import('./route');

    const req = new Request(
      'http://localhost:3000/api/repositorio/informe-ejecutivo',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      },
    );

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.report).toBeDefined();
    expect(data.report.title).toBeTruthy();
  });

  it('returns 502 when OpenAI returns non-retryable error', async () => {
    mockSupabaseData = [
      {
        id: '1',
        titulo: 'Mortalidad infantil (TMI Cba)',
        categoria_db: 'salud',
        contenido: 'salud | Mortalidad infantil (TMI Cba) | valor: 8.5 ‰ | período: 2022 | región: Córdoba',
        fuente: 'DEIS',
        periodo: '2022',
        ejes_relacionados: null,
      },
    ];

    vi.resetModules();
    // Non-rate-limit error throws immediately (no retry delay)
    const errorFetch = vi.fn().mockRejectedValue(
      new Error('OpenAI API connection refused'),
    );
    vi.stubGlobal('fetch', errorFetch);
    const { POST } = await import('./route');

    const req = new Request(
      'http://localhost:3000/api/repositorio/informe-ejecutivo',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ axes: ['salud'] }),
      },
    );

    const res = await POST(req);
    expect(res.status).toBe(502);

    const data = await res.json();
    expect(data.error).toBeTruthy();
  });

  it('returns 404 when no indicators found', async () => {
    mockSupabaseData = [];

    vi.resetModules();
    vi.stubGlobal('fetch', createMockFetch(true, mockOpenAIResponse));
    const { POST } = await import('./route');

    const req = new Request(
      'http://localhost:3000/api/repositorio/informe-ejecutivo',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ axes: ['inversion'] }),
      },
    );

    const res = await POST(req);
    expect(res.status).toBe(404);

    const data = await res.json();
    expect(data.error).toContain('No se encontraron indicadores');
  });

  // ── New tests for enriched flow ────────────────────────────────

  it('includes critical report fields (dataQuality, discrepancies, etc.) in response', async () => {
    mockSupabaseData = [
      {
        id: '1',
        titulo: 'Mortalidad infantil (TMI Cba)',
        categoria_db: 'salud',
        contenido: 'salud | Mortalidad infantil (TMI Cba) | valor: 8.5 ‰ | período: 2022 | región: Córdoba',
        fuente: 'DEIS',
        periodo: '2022',
        ejes_relacionados: null,
      },
    ];

    vi.resetModules();
    vi.stubGlobal('fetch', createMockFetch(true, mockOpenAIResponse));
    const { POST } = await import('./route');

    const req = new Request(
      'http://localhost:3000/api/repositorio/informe-ejecutivo',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ axes: ['salud'] }),
      },
    );

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.report).toBeDefined();

    // Verify all critical report fields exist with correct types
    expect(data.report.dataQuality).toBeDefined();
    expect(Array.isArray(data.report.dataQuality)).toBe(true);
    if (data.report.dataQuality.length > 0) {
      expect(data.report.dataQuality[0]).toHaveProperty('category');
      expect(data.report.dataQuality[0]).toHaveProperty('rating');
      expect(data.report.dataQuality[0]).toHaveProperty('issues');
    }

    expect(data.report.discrepancies).toBeDefined();
    expect(Array.isArray(data.report.discrepancies)).toBe(true);

    expect(data.report.crossReferences).toBeDefined();
    expect(Array.isArray(data.report.crossReferences)).toBe(true);

    expect(data.report.suggestedImprovements).toBeDefined();
    expect(Array.isArray(data.report.suggestedImprovements)).toBe(true);
  });

  it('handles empty documents gracefully (still returns report)', async () => {
    mockSupabaseData = [
      {
        id: '1',
        titulo: 'Pobreza personas',
        categoria_db: 'pobreza',
        contenido: 'pobreza | Pobreza personas | valor: 38.5 % | período: 2024 | región: Córdoba',
        fuente: 'INDEC',
        periodo: '2024',
        ejes_relacionados: null,
      },
    ];

    vi.resetModules();
    vi.stubGlobal('fetch', createMockFetch(true, mockOpenAIResponse));
    const { POST } = await import('./route');

    const req = new Request(
      'http://localhost:3000/api/repositorio/informe-ejecutivo',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ axes: ['pobreza'] }),
      },
    );

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.report).toBeDefined();
    expect(data.report.title).toBeTruthy();
  });

  it('handles web search failure gracefully (still returns report)', async () => {
    mockSupabaseData = [
      {
        id: '1',
        titulo: 'Pobreza personas',
        categoria_db: 'pobreza',
        contenido: 'pobreza | Pobreza personas | valor: 38.5 % | período: 2024 | región: Córdoba',
        fuente: 'INDEC',
        periodo: '2024',
        ejes_relacionados: null,
      },
    ];

    vi.resetModules();
    // Web search call will fail (first fetch call), OpenAI call will succeed
    let fetchCallCount = 0;
    const webSearchFails = vi.fn().mockImplementation(() => {
      fetchCallCount++;
      if (fetchCallCount === 1) {
        return Promise.reject(new Error('Web search failed'));
      }
      return Promise.resolve({
        ok: true,
        json: async () => mockOpenAIResponse,
        text: async () => JSON.stringify(mockOpenAIResponse),
        status: 200,
      });
    });
    vi.stubGlobal('fetch', webSearchFails);

    const { POST } = await import('./route');

    const req = new Request(
      'http://localhost:3000/api/repositorio/informe-ejecutivo',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ axes: ['pobreza'] }),
      },
    );

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.report).toBeDefined();
    expect(data.report.title).toBeTruthy();
  });
});
