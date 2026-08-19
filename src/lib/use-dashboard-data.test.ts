import { describe, it, expect, vi } from 'vitest';
import { CHILD_RELEVANT_CATEGORIES } from './inversion-constants';
import type { Indicador } from './use-dashboard-data';

// Mock supabase before importing modules that depend on it
vi.mock('@/lib/supabase', () => ({
  supabase: {},
  CategoriaIndicador: 'inversion',
}));

// Now import — these depend on the mocked supabase
const useDashboardDataModule = await import('./use-dashboard-data');
const {
  parseDesglose,
  getInversionTotal,
  getPoblacion0a17,
  normalizeIndicador,
  getLatestValue,
  getTimeSeries,
} = useDashboardDataModule;

describe('parseDesglose (exported from use-dashboard-data)', () => {
  it('should parse a string that contains JSON', () => {
    const raw = '{"categoria": "Educación básica"}';
    const result = parseDesglose(raw);
    expect(result).toEqual({ categoria: 'Educación básica' });
  });

  it('should return empty object for null input', () => {
    expect(parseDesglose(null)).toEqual({});
  });

  it('should handle double-encoded JSONB (object with stringified values)', () => {
    const raw = { categoria: '{"nested": "value"}' };
    const result = parseDesglose(raw);
    expect(result).toEqual({ categoria: { nested: 'value' } });
  });

  it('should handle already-parsed object', () => {
    const raw = { categoria: 'Educación básica', organismo: 'Ministerio' };
    const result = parseDesglose(raw);
    expect(result).toEqual({ categoria: 'Educación básica', organismo: 'Ministerio' });
  });
});

describe('getInversionTotal uses CHILD_RELEVANT_CATEGORIES from constants', () => {
  it('should match known child-relevant categories', () => {
    const data: Indicador[] = [
      {
        id: '1',
        indicador_nombre: 'Test',
        categoria: 'inversion',
        valor: 50_000_000,
        unidad: '',
        periodo: '2024',
        region: '',
        desglose: { categoria: 'Comedores escolares y copa de leche' },
      },
    ];
    const total = getInversionTotal(data);
    expect(total).toBe(50_000_000);
  });

  it('should use the same categories as inversion-constants', () => {
    const data: Indicador[] = [
      {
        id: '1',
        indicador_nombre: 'Test',
        categoria: 'inversion',
        valor: 10_000_000,
        unidad: '',
        periodo: '2024',
        region: '',
        desglose: { categoria: CHILD_RELEVANT_CATEGORIES[0] },
      },
    ];
    expect(getInversionTotal(data)).toBe(10_000_000);
  });
});

describe('normalizeIndicador (fuente field)', () => {
  it('should preserve fuente when present in raw data', () => {
    const raw = {
      id: 'test1',
      indicador_nombre: 'Test indicator',
      categoria: 'salud',
      valor: 42.5,
      unidad: '%',
      periodo: '2024',
      region: 'Córdoba',
      desglose: {},
      fuente: 'Ministerio de Salud',
    };
    const result = normalizeIndicador(raw);
    expect(result.fuente).toBe('Ministerio de Salud');
  });

  it('should set fuente to undefined when not in raw data', () => {
    const raw = {
      id: 'test2',
      indicador_nombre: 'Test indicator',
      categoria: 'salud',
      valor: 42.5,
      unidad: '%',
      periodo: '2024',
      region: 'Córdoba',
      desglose: {},
    };
    const result = normalizeIndicador(raw);
    expect(result.fuente).toBeUndefined();
  });
});

// ─── getPoblacion0a17: triple-counting fix ──────────────────────────
describe('getPoblacion0a17 — sexo=total filter', () => {
  it('should only count rows with sexo=total to avoid triple-counting', () => {
    const data: Indicador[] = [
      // Age 0 — three sex categories
      {
        id: '1',
        indicador_nombre: 'Población por edad',
        categoria: 'demografia',
        valor: 40495,
        unidad: 'hab',
        periodo: '2022',
        region: 'Córdoba',
        desglose: { edad: '0', sexo: 'total' },
      },
      {
        id: '2',
        indicador_nombre: 'Población por edad',
        categoria: 'demografia',
        valor: 19956,
        unidad: 'hab',
        periodo: '2022',
        region: 'Córdoba',
        desglose: { edad: '0', sexo: 'femenino' },
      },
      {
        id: '3',
        indicador_nombre: 'Población por edad',
        categoria: 'demografia',
        valor: 20539,
        unidad: 'hab',
        periodo: '2022',
        region: 'Córdoba',
        desglose: { edad: '0', sexo: 'masculino' },
      },
      // Age 1 — three sex categories
      {
        id: '4',
        indicador_nombre: 'Población por edad',
        categoria: 'demografia',
        valor: 41845,
        unidad: 'hab',
        periodo: '2022',
        region: 'Córdoba',
        desglose: { edad: '1', sexo: 'total' },
      },
      {
        id: '5',
        indicador_nombre: 'Población por edad',
        categoria: 'demografia',
        valor: 20706,
        unidad: 'hab',
        periodo: '2022',
        region: 'Córdoba',
        desglose: { edad: '1', sexo: 'femenino' },
      },
      {
        id: '6',
        indicador_nombre: 'Población por edad',
        categoria: 'demografia',
        valor: 21139,
        unidad: 'hab',
        periodo: '2022',
        region: 'Córdoba',
        desglose: { edad: '1', sexo: 'masculino' },
      },
    ];

    const result = getPoblacion0a17(data);
    // Should be 40495 + 41845 = 82340 (only sexo=total)
    // NOT 40495+19956+20539+41845+20706+21139 = 164680 (triple-counted)
    expect(result).toBe(82340);
  });

  it('should return 0 when no demografia data', () => {
    expect(getPoblacion0a17([])).toBe(0);
    expect(getPoblacion0a17(undefined as unknown as Indicador[])).toBe(0);
  });

  it('should handle mixed sexo values gracefully (prefer total)', () => {
    const data: Indicador[] = [
      {
        id: '1',
        indicador_nombre: 'Población por edad',
        categoria: 'demografia',
        valor: 50000,
        unidad: 'hab',
        periodo: '2022',
        region: 'Córdoba',
        desglose: { edad: '5', sexo: 'total' },
      },
      {
        id: '2',
        indicador_nombre: 'Población por edad',
        categoria: 'demografia',
        valor: 25000,
        unidad: 'hab',
        periodo: '2022',
        region: 'Córdoba',
        desglose: { edad: '5', sexo: 'femenino' },
      },
    ];
    // Should only count the total row
    expect(getPoblacion0a17(data)).toBe(50000);
  });
});

// ─── getLatestValue: indicator lookup ──────────────────────────────
describe('getLatestValue — indicator lookup', () => {
  it('should return the most recent indicator by name', () => {
    const data: Indicador[] = [
      {
        id: '1',
        indicador_nombre: 'Tasa de asistencia educativa',
        categoria: 'educacion',
        valor: 85,
        unidad: '%',
        periodo: '2020',
        region: 'Córdoba',
        desglose: {},
      },
      {
        id: '2',
        indicador_nombre: 'Tasa de asistencia educativa',
        categoria: 'educacion',
        valor: 89,
        unidad: '%',
        periodo: '2022',
        region: 'Córdoba',
        desglose: {},
      },
    ];
    const result = getLatestValue(data, 'asistencia educativa');
    expect(result?.valor).toBe(89);
    expect(result?.periodo).toBe('2022');
  });

  it('should return null for empty array', () => {
    expect(getLatestValue([], 'test')).toBeNull();
  });
});

// ─── getTimeSeries: time series data ───────────────────────────────
describe('getTimeSeries — time series', () => {
  it('should return sorted time series for matching indicator', () => {
    const data: Indicador[] = [
      {
        id: '1',
        indicador_nombre: 'TMI Cba',
        categoria: 'salud',
        valor: 10,
        unidad: '‰',
        periodo: '2020',
        region: 'Córdoba',
        desglose: {},
      },
      {
        id: '2',
        indicador_nombre: 'TMI Cba',
        categoria: 'salud',
        valor: 8,
        unidad: '‰',
        periodo: '2022',
        region: 'Córdoba',
        desglose: {},
      },
      {
        id: '3',
        indicador_nombre: 'TMI Nacional',
        categoria: 'salud',
        valor: 12,
        unidad: '‰',
        periodo: '2022',
        region: 'Argentina',
        desglose: {},
      },
    ];
    const result = getTimeSeries(data, 'TMI Cba');
    expect(result).toHaveLength(2);
    expect(result[0].periodo).toBe('2020');
    expect(result[1].periodo).toBe('2022');
  });
});
