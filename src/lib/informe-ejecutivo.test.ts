import { describe, it, expect } from 'vitest';
import {
  buildSystemPrompt,
  buildReportPayload,
  type IndicadorRow,
} from './informe-ejecutivo';

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
});

describe('buildReportPayload', () => {
  const baseIndicators: IndicadorRow[] = [
    {
      id: '1',
      indicador_nombre: 'Pobreza personas',
      categoria: 'pobreza',
      valor: 38.5,
      unidad: '%',
      periodo: '2024',
      region: 'Córdoba',
      desglose: {},
      fuente: 'INDEC',
    },
    {
      id: '2',
      indicador_nombre: 'Pobreza personas',
      categoria: 'pobreza',
      valor: 42.1,
      unidad: '%',
      periodo: '2023',
      region: 'Córdoba',
      desglose: {},
      fuente: 'INDEC',
    },
    {
      id: '3',
      indicador_nombre: 'Pobreza personas',
      categoria: 'pobreza',
      valor: 44.0,
      unidad: '%',
      periodo: '2022',
      region: 'Córdoba',
      desglose: {},
      fuente: 'INDEC',
    },
    {
      id: '4',
      indicador_nombre: 'Pobreza personas',
      categoria: 'pobreza',
      valor: 46.2,
      unidad: '%',
      periodo: '2021',
      region: 'Córdoba',
      desglose: {},
      fuente: 'INDEC',
    },
    {
      id: '5',
      indicador_nombre: 'Mortalidad infantil (TMI Cba)',
      categoria: 'salud',
      valor: 8.5,
      unidad: '‰',
      periodo: '2022',
      region: 'Córdoba',
      desglose: {},
      fuente: 'DEIS',
    },
    {
      id: '6',
      indicador_nombre: 'Mortalidad infantil (TMI Cba)',
      categoria: 'salud',
      valor: 9.1,
      unidad: '‰',
      periodo: '2021',
      region: 'Córdoba',
      desglose: {},
      fuente: 'DEIS',
    },
  ];

  it('should group indicators by category', () => {
    const payload = buildReportPayload(['pobreza', 'salud'], baseIndicators);
    expect(payload.categories).toHaveProperty('pobreza');
    expect(payload.categories).toHaveProperty('salud');
  });

  it('should include only requested categories', () => {
    const payload = buildReportPayload(['salud'], baseIndicators);
    expect(payload.categories).toHaveProperty('salud');
    expect(payload.categories).not.toHaveProperty('pobreza');
  });

  it('should limit to latest 3 periods per indicator', () => {
    const payload = buildReportPayload(['pobreza'], baseIndicators);
    const pobrezaInd = payload.categories['pobreza']?.indicators[0];
    expect(pobrezaInd).toBeDefined();
    expect(pobrezaInd!.values.length).toBeLessThanOrEqual(3);
    // The 4th period (2021) should be excluded
    const periods = pobrezaInd!.values.map(v => v.periodo);
    expect(periods).not.toContain('2021');
  });

  it('should sort periods in descending order', () => {
    const payload = buildReportPayload(['pobreza'], baseIndicators);
    const pobrezaInd = payload.categories['pobreza']?.indicators[0];
    const periods = pobrezaInd!.values.map(v => v.periodo);
    expect(periods).toEqual(['2024', '2023', '2022']);
  });

  it('should include generatedAt timestamp', () => {
    const payload = buildReportPayload(['salud'], baseIndicators);
    expect(payload.generatedAt).toBeDefined();
    expect(typeof payload.generatedAt).toBe('string');
    // Should be a valid ISO date
    expect(() => new Date(payload.generatedAt)).not.toThrow();
  });

  it('should handle empty data gracefully', () => {
    const payload = buildReportPayload(['pobreza'], []);
    expect(payload.categories).toHaveProperty('pobreza');
    expect(payload.categories['pobreza']?.indicators).toHaveLength(0);
  });

  it('should handle empty categories list (include all)', () => {
    const payload = buildReportPayload([], baseIndicators);
    // Should include all categories present in the data
    expect(payload.categories).toHaveProperty('pobreza');
    expect(payload.categories).toHaveProperty('salud');
  });

  it('should include indicator metadata (name, unidad, fuente)', () => {
    const payload = buildReportPayload(['salud'], baseIndicators);
    const saludInd = payload.categories['salud']?.indicators[0];
    expect(saludInd).toBeDefined();
    expect(saludInd!.name).toBe('Mortalidad infantil (TMI Cba)');
    expect(saludInd!.values[0]?.unidad).toBe('‰');
  });
});
