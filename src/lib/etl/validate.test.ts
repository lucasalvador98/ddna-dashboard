import { describe, it, expect } from 'vitest';
import { validateRows } from './validate';

describe('validateRows', () => {
  it('accepts valid rows', () => {
    const { valid, warnings } = validateRows([
      {
        indicador_nombre: 'Pobreza',
        categoria: 'pobreza',
        valor: 42.5,
        unidad: '%',
        periodo: 2024,
        region: 'Córdoba',
        fuente: 'INDEC',
      },
    ]);
    expect(valid).toHaveLength(1);
    expect(warnings).toHaveLength(0);
    expect(valid[0].valor).toBe(42.5);
  });

  it('rejects NaN and empty valor', () => {
    const { valid, warnings } = validateRows([
      { indicador_nombre: 'X', categoria: 'pobreza', valor: null, unidad: '%', periodo: 2024, region: 'Córdoba', fuente: 'INDEC' } as any,
      { indicador_nombre: 'Y', categoria: 'pobreza', valor: 'not-a-number', unidad: '%', periodo: 2024, region: 'Córdoba', fuente: 'INDEC' } as any,
    ]);
    expect(valid).toHaveLength(0);
    expect(warnings).toHaveLength(2);
  });

  it('rejects out of range %', () => {
    const { valid, warnings } = validateRows([
      { indicador_nombre: 'X', categoria: 'pobreza', valor: 150, unidad: '%', periodo: 2024, region: 'Córdoba', fuente: 'INDEC' },
    ]);
    expect(valid).toHaveLength(0);
    expect(warnings[0]).toMatch(/fuera de rango/);
  });

  it('handles string valor and periodo', () => {
    const { valid } = validateRows([
      { indicador_nombre: 'X', categoria: 'pobreza', valor: '42.5', unidad: '%', periodo: '2024', region: 'Córdoba', fuente: 'INDEC' } as any,
    ]);
    expect(valid).toHaveLength(1);
    expect(valid[0].valor).toBe(42.5);
    expect(valid[0].periodo).toBe(2024);
  });
});
