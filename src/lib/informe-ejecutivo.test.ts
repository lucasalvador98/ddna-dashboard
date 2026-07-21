import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  buildSystemPrompt,
  buildReportPayload,
  searchDocuments,
  searchWebContext,
  type IndicadorRow,
} from './informe-ejecutivo';
import {
  mockSalud,
  mockPobreza,
  mockAprender,
  mockEducacion,
  allMockIndicadores,
} from './mockIndicadores';

describe('buildSystemPrompt', () => {
  it('should return a string with executive report instructions', () => {
    const prompt = buildSystemPrompt();
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(100);
  });

  it('should mention DDNA and analyst role', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toMatch(/DDNA|analista|data analyst/i);
  });

  it('should instruct to use only provided numbers', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toMatch(/solo|únicamente|exactos|proporcionados/i);
  });

  it('should reference the JSON output structure', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toMatch(/title|overview|sections|conclusion|recommendations/);
  });

  it('should mention positive/negative/neutral highlights', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toMatch(/positivo|negativo|neutral|highlight|tendencia/i);
  });

  it('should contain specific domain rules (INDEC zero values, TMI threshold, school sector/quintile)', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toMatch(/2013.*2015|indec/i);
    expect(prompt).toMatch(/tasa de mortalidad infantil|tmi.*10‰/i);
    expect(prompt).toMatch(/q1-estatal|q5-privado|quintil/i);
  });
});

describe('buildReportPayload', () => {
  it('should group indicators by category', () => {
    const payload = buildReportPayload(['pobreza', 'salud'], allMockIndicadores);
    expect(payload.categories).toHaveProperty('pobreza');
    expect(payload.categories).toHaveProperty('salud');
  });

  it('should include only requested categories', () => {
    const payload = buildReportPayload(['salud'], allMockIndicadores);
    expect(payload.categories).toHaveProperty('salud');
    expect(payload.categories).not.toHaveProperty('pobreza');
  });

  it('should limit to latest 3 periods per indicator', () => {
    // deis in mockIndicadores has 5 periods for Cordoba (2022, 2021, 2020, 2019, 2018)
    const payload = buildReportPayload(['deis'], allMockIndicadores);
    const deisInd = payload.categories['deis']?.indicators[0];
    expect(deisInd).toBeDefined();
    expect(deisInd!.values.length).toBeLessThanOrEqual(3);
    const periods = deisInd!.values.map(v => v.periodo);
    expect(periods).not.toContain('2019');
    expect(periods).not.toContain('2018');
  });

  it('should sort periods in descending order', () => {
    const payload = buildReportPayload(['salud'], allMockIndicadores);
    const saludInd = payload.categories['salud']?.indicators[0]; // TMI Cba
    const periods = saludInd!.values.map(v => v.periodo);
    expect(periods).toEqual(['2022', '2021', '2020']);
  });

  it('should sort semestral periods correctly (comparePeriodo)', () => {
    const semestralRows: IndicadorRow[] = [
      {
        id: '1',
        indicador_nombre: 'Pobreza personas',
        categoria: 'pobreza',
        valor: 10,
        unidad: '%',
        periodo: '2024-S1',
        region: 'Córdoba',
        desglose: {},
      },
      {
        id: '2',
        indicador_nombre: 'Pobreza personas',
        categoria: 'pobreza',
        valor: 12,
        unidad: '%',
        periodo: '2024-S2',
        region: 'Córdoba',
        desglose: {},
      },
      {
        id: '3',
        indicador_nombre: 'Pobreza personas',
        categoria: 'pobreza',
        valor: 15,
        unidad: '%',
        periodo: '2023-S2',
        region: 'Córdoba',
        desglose: {},
      },
    ];

    const payloadSemestral = buildReportPayload(['pobreza'], semestralRows);
    const testInd = payloadSemestral.categories['pobreza']?.indicators[0];
    const periods = testInd!.values.map(v => v.periodo);
    expect(periods).toEqual(['2024-S2', '2024-S1', '2023-S2']);
  });

  it('should include generatedAt timestamp', () => {
    const payload = buildReportPayload(['salud'], allMockIndicadores);
    expect(payload.generatedAt).toBeDefined();
    expect(typeof payload.generatedAt).toBe('string');
    expect(() => new Date(payload.generatedAt)).not.toThrow();
  });

  it('should handle empty data gracefully', () => {
    const payload = buildReportPayload(['pobreza'], []);
    expect(payload.categories).toHaveProperty('pobreza');
    expect(payload.categories['pobreza']?.indicators).toHaveLength(0);
  });

  it('should handle empty categories list (include all)', () => {
    const payload = buildReportPayload([], allMockIndicadores);
    expect(payload.categories).toHaveProperty('pobreza');
    expect(payload.categories).toHaveProperty('salud');
    expect(payload.categories).toHaveProperty('aprender');
  });

  it('should include indicator metadata (name, unidad, region, desglose, fuente)', () => {
    const payload = buildReportPayload(['salud'], allMockIndicadores);
    const saludInd = payload.categories['salud']?.indicators[0];
    expect(saludInd).toBeDefined();
    expect(saludInd!.name).toBe('Mortalidad infantil (TMI Cba)');
    expect(saludInd!.values[0]?.unidad).toBe('‰');
    expect(saludInd!.values[0]?.region).toBe('Córdoba');
    expect(saludInd!.values[0]?.desglose).toHaveProperty('fuente');
    expect(saludInd!.values[0]?.fuente).toBe('DEIS');
  });
});

// ─── searchDocuments ──────────────────────────────────────────

describe('searchDocuments', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockDocData = [
    {
      titulo: 'Ministerio de Salud - informe-salud-2022.pdf',
      contenido:
        'La mortalidad infantil en Córdoba se ha reducido significativamente en la última década, alcanzando una tasa de 8.5 por mil nacidos vivos en 2022.',
    },
    {
      titulo: 'Observatorio de Salud',
      contenido:
        'Los indicadores de salud muestran una tendencia positiva en la reducción de la mortalidad infantil en la provincia.',
    },
  ];

  function createMockSupabase(data: unknown[]) {
    function chain() {
      return {
        eq: () => chain(),
        limit: (n: number) => Promise.resolve({ data: data.slice(0, n), error: null }),
      };
    }
    return {
      from: () => ({
        select: () => chain(),
      }),
    } as never;
  }

  it('should return results from doc_chunks for a known category', async () => {
    const client = createMockSupabase(mockDocData);
    const results = await searchDocuments(client, 'salud', 2);
    expect(results).toHaveLength(2);
    expect(results[0].title).toContain('Ministerio de Salud');
    expect(results[0].content.length).toBeLessThanOrEqual(500);
  });

  it('should truncate content to 500 characters', async () => {
    const longContent = 'A'.repeat(1000);
    const client = createMockSupabase([
      { titulo: 'Test', contenido: longContent },
    ]);
    const results = await searchDocuments(client, 'salud', 1);
    expect(results[0].content.length).toBe(500);
  });

  it('should return empty array when no results found', async () => {
    const client = createMockSupabase([]);
    const results = await searchDocuments(client, 'inexistente', 3);
    expect(results).toHaveLength(0);
  });

  it('should handle supabase error gracefully', async () => {
    function errorChain() {
      return {
        eq: () => errorChain(),
        limit: () => Promise.resolve({ data: null, error: new Error('DB error') }),
      };
    }
    const client = {
      from: () => ({
        select: () => errorChain(),
      }),
    } as never;
    const results = await searchDocuments(client, 'salud', 3);
    expect(results).toHaveLength(0);
  });

  it('should use "Documento" as title when no titulo field', async () => {
    const client = createMockSupabase([
      { titulo: null, contenido: 'Some content' },
    ]);
    const results = await searchDocuments(client, 'test', 1);
    expect(results[0].title).toBe('Documento');
  });
});

// ─── searchWebContext ─────────────────────────────────────────

describe('searchWebContext', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockDdgHtml = `
    <html>
    <body>
      <a rel="nofollow" class="result__a" href="https://example.com/salud-infantil">
        Salud Infantil en Argentina
      </a>
      <a class="result__snippet">Indicadores de salud infantil muestran mejora en tasa de mortalidad.</a>
      <a rel="nofollow" class="result__a" href="https://example.com/nnya-cordoba">
        NNyA Córdoba - Informe 2024
      </a>
      <a class="result__snippet">Córdoba redujo la tasa de mortalidad infantil a 8.5 por mil.</a>
    </body>
    </html>
  `;

  it('should parse results from DuckDuckGo HTML', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(mockDdgHtml),
      }),
    );

    const results = await searchWebContext('salud', 2);
    expect(results).toHaveLength(2);
    expect(results[0].title).toBe('Salud Infantil en Argentina');
    expect(results[0].url).toBe('https://example.com/salud-infantil');
    expect(results[0].snippet).toContain('mejora');
  });

  it('should limit results to maxResults', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(mockDdgHtml),
      }),
    );

    const results = await searchWebContext('salud', 1);
    expect(results).toHaveLength(1);
  });

  it('should return empty array on fetch failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error')),
    );

    const results = await searchWebContext('salud', 3);
    expect(results).toEqual([]);
  });

  it('should return empty array on empty HTML', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue('<html></html>'),
      }),
    );

    const results = await searchWebContext('salud', 3);
    expect(results).toEqual([]);
  });
});
