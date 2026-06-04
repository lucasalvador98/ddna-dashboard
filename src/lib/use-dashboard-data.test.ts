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
const { parseDesglose, getInversionTotal, normalizeIndicador } = useDashboardDataModule;

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
        id: '1', indicador_nombre: 'Test', categoria: 'inversion',
        valor: 50_000_000, unidad: '', periodo: '2024', region: '',
        desglose: { categoria: 'Comedores escolares y copa de leche' },
      },
    ];
    const total = getInversionTotal(data);
    expect(total).toBe(50_000_000);
  });

  it('should use the same categories as inversion-constants', () => {
    const data: Indicador[] = [
      {
        id: '1', indicador_nombre: 'Test', categoria: 'inversion',
        valor: 10_000_000, unidad: '', periodo: '2024', region: '',
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
