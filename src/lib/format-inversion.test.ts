import { describe, it, expect } from 'vitest';
import {
  CHILD_RELEVANT_CATEGORIES,
  SCALE_FACTOR,
  SCALE_LABEL,
  EDUCATION_CATEGORY_FRAGMENTS,
  HEALTH_CATEGORY_FRAGMENTS,
} from './inversion-constants';
import {
  formatInversionValue,
  getInversionTotal,
  getInversionByCategory,
  formatInversionChange,
  isEducacionCategory,
  isSaludCategory,
} from './format-inversion';
import type { Indicador } from './use-dashboard-data';

describe('inversion-constants', () => {
  it('should export SCALE_FACTOR as 1_000_000', () => {
    expect(SCALE_FACTOR).toBe(1_000_000);
  });

  it('should export SCALE_LABEL as "Md"', () => {
    expect(SCALE_LABEL).toBe('Md');
  });

  it('should export CHILD_RELEVANT_CATEGORIES with known categories', () => {
    expect(CHILD_RELEVANT_CATEGORIES).toContain('Educación básica (inicial, elemental y media)');
    expect(CHILD_RELEVANT_CATEGORIES).toContain('Materno-infantil');
    expect(CHILD_RELEVANT_CATEGORIES).toContain('Trabajo infantil');
    expect(CHILD_RELEVANT_CATEGORIES.length).toBeGreaterThan(5);
  });

  it('should export EDUCATION_CATEGORY_FRAGMENTS with relevant fragments', () => {
    expect(EDUCATION_CATEGORY_FRAGMENTS).toContain('educación');
    expect(EDUCATION_CATEGORY_FRAGMENTS.length).toBeGreaterThanOrEqual(1);
  });

  it('should export HEALTH_CATEGORY_FRAGMENTS with relevant fragments', () => {
    expect(HEALTH_CATEGORY_FRAGMENTS).toContain('materno-infantil');
    expect(HEALTH_CATEGORY_FRAGMENTS.length).toBeGreaterThanOrEqual(1);
  });
});

describe('formatInversionValue', () => {
  it('should format a large number as millions with "Md" label', () => {
    // 45,200,000,000 raw pesos → $45,200.0 Md
    const result = formatInversionValue(45_200_000_000);
    expect(result).toBe('$45,200.0 Md');
  });

  it('should return "$—" for zero', () => {
    expect(formatInversionValue(0)).toBe('$—');
  });

  it('should return "$—" for negative values', () => {
    expect(formatInversionValue(-100)).toBe('$—');
  });

  it('should handle small values correctly', () => {
    // 1,234,567 → $1.2 Md
    const result = formatInversionValue(1_234_567);
    expect(result).toBe('$1.2 Md');
  });

  it('should format with one decimal place', () => {
    // 1,500,000 → $1.5 Md
    expect(formatInversionValue(1_500_000)).toBe('$1.5 Md');
    // 1,550,000 → $1.6 Md
    expect(formatInversionValue(1_550_000)).toBe('$1.6 Md');
  });

  it('should format 1 billion correctly', () => {
    // 1,000,000,000 → $1,000.0 Md
    expect(formatInversionValue(1_000_000_000)).toBe('$1,000.0 Md');
  });
});

describe('getInversionTotal', () => {
  const mockData: Indicador[] = [
    {
      id: '1', indicador_nombre: 'Test', categoria: 'inversion',
      valor: 10_000_000, unidad: '', periodo: '2024', region: '',
      desglose: { categoria: 'Educación básica (inicial, elemental y media)' },
    },
    {
      id: '2', indicador_nombre: 'Test2', categoria: 'inversion',
      valor: 20_000_000, unidad: '', periodo: '2024', region: '',
      desglose: { categoria: 'Materno-infantil' },
    },
    {
      id: '3', indicador_nombre: 'Test3', categoria: 'inversion',
      valor: 5_000_000, unidad: '', periodo: '2023', region: '',
      desglose: { categoria: 'Educación básica (inicial, elemental y media)' },
    },
    {
      id: '4', indicador_nombre: 'Test4', categoria: 'inversion',
      valor: 1_000_000, unidad: '', periodo: '2024', region: '',
      desglose: { categoria: 'No relevante' },
    },
  ];

  it('should sum all child-relevant categories for the given period', () => {
    const total = getInversionTotal(mockData, '2024');
    // 10M (educación) + 20M (salud) = 30M. No relevante is excluded.
    expect(total).toBe(30_000_000);
  });

  it('should return 0 for a period with no data', () => {
    expect(getInversionTotal(mockData, '2025')).toBe(0);
  });

  it('should return 0 for empty array', () => {
    expect(getInversionTotal([], '2024')).toBe(0);
  });

  it('should use provided categories when specified', () => {
    const onlyEducation = ['Educación básica (inicial, elemental y media)'];
    const total = getInversionTotal(mockData, '2024', onlyEducation);
    expect(total).toBe(10_000_000);
  });

  it('should handle entries with undefined desglose', () => {
    const dataWithNull: Indicador[] = [
      {
        id: '5', indicador_nombre: 'Test5', categoria: 'inversion',
        valor: 15_000_000, unidad: '', periodo: '2024', region: '',
        desglose: {} as Record<string, unknown>,
      },
    ];
    expect(getInversionTotal(dataWithNull, '2024')).toBe(0);
  });

  it('should use latest period when not specified', () => {
    // Should default to latest period ('2024')
    const total = getInversionTotal(mockData);
    expect(total).toBe(30_000_000);
  });
});

describe('getInversionByCategory', () => {
  const mockData: Indicador[] = [
    {
      id: '1', indicador_nombre: 'Test', categoria: 'inversion',
      valor: 10_000_000, unidad: '', periodo: '2024', region: '',
      desglose: { categoria: 'Educación básica (inicial, elemental y media)' },
    },
    {
      id: '2', indicador_nombre: 'Test2', categoria: 'inversion',
      valor: 20_000_000, unidad: '', periodo: '2024', region: '',
      desglose: { categoria: 'Materno-infantil' },
    },
    {
      id: '3', indicador_nombre: 'Test3', categoria: 'inversion',
      valor: 5_000_000, unidad: '', periodo: '2024', region: '',
      desglose: { categoria: 'Educación básica (inicial, elemental y media)' },
    },
    {
      id: '4', indicador_nombre: 'Test4', categoria: 'inversion',
      valor: 3_000_000, unidad: '', periodo: '2023', region: '',
      desglose: { categoria: 'Materno-infantil' },
    },
  ];

  it('should group and sum values by category for the given period', () => {
    const result = getInversionByCategory(mockData, '2024');
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ name: 'Educación básica (inicial, elemental y media)', value: 15_000_000 });
    expect(result).toContainEqual({ name: 'Materno-infantil', value: 20_000_000 });
  });

  it('should return empty array for period with no data', () => {
    expect(getInversionByCategory(mockData, '2025')).toEqual([]);
  });

  it('should return empty array for empty input', () => {
    expect(getInversionByCategory([], '2024')).toEqual([]);
  });

  it('should use latest period when not specified', () => {
    const result = getInversionByCategory(mockData);
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ name: 'Educación básica (inicial, elemental y media)', value: 15_000_000 });
  });

  it('should handle entries with missing categoria in desglose', () => {
    const dataWithMissing: Indicador[] = [
      {
        id: '5', indicador_nombre: 'Test5', categoria: 'inversion',
        valor: 7_000_000, unidad: '', periodo: '2024', region: '',
        desglose: {} as Record<string, unknown>,
      },
    ];
    const result = getInversionByCategory(dataWithMissing, '2024');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ name: 'Sin categoría', value: 7_000_000 });
  });
});

describe('formatInversionChange', () => {
  it('should format positive change with "+" prefix and "%" suffix', () => {
    expect(formatInversionChange(12.3)).toBe('+12.3%');
  });

  it('should format negative change with "-" prefix and "%" suffix', () => {
    expect(formatInversionChange(-5.7)).toBe('-5.7%');
  });

  it('should format zero change', () => {
    expect(formatInversionChange(0)).toBe('+0.0%');
  });

  it('should return undefined for null', () => {
    expect(formatInversionChange(null)).toBeUndefined();
  });

  it('should return undefined for undefined', () => {
    expect(formatInversionChange(undefined as unknown as number | null)).toBeUndefined();
  });
});

describe('KPI category matching', () => {
  describe('isEducacionCategory', () => {
    it('should match "Educación básica (inicial, elemental y media)"', () => {
      expect(isEducacionCategory('Educación básica (inicial, elemental y media)')).toBe(true);
    });

    it('should match "Calidad educativa, gestión curricular y capacitaci"', () => {
      expect(isEducacionCategory('Calidad educativa, gestión curricular y capacitaci')).toBe(true);
    });

    it('should not match "Materno-infantil"', () => {
      expect(isEducacionCategory('Materno-infantil')).toBe(false);
    });

    it('should not match empty string', () => {
      expect(isEducacionCategory('')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(isEducacionCategory('EDUCACIÓN SUPERIOR')).toBe(true);
      expect(isEducacionCategory('Educación')).toBe(true);
    });
  });

  describe('isSaludCategory', () => {
    it('should match "Materno-infantil"', () => {
      expect(isSaludCategory('Materno-infantil')).toBe(true);
    });

    it('should match "Atención ambulatoria e internación"', () => {
      expect(isSaludCategory('Atención ambulatoria e internación')).toBe(true);
    });

    it('should match "Prevención de enfermedades y riesgos específicos"', () => {
      expect(isSaludCategory('Prevención de enfermedades y riesgos específicos')).toBe(true);
    });

    it('should not match "Educación básica"', () => {
      expect(isSaludCategory('Educación básica (inicial, elemental y media)')).toBe(false);
    });

    it('should not match empty string', () => {
      expect(isSaludCategory('')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(isSaludCategory('SALUD PÚBLICA')).toBe(true);
    });
  });
});
