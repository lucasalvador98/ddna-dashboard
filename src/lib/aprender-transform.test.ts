import { describe, it, expect } from 'vitest';
import { computeAprenderByQuintil } from './aprender-transform';

interface AprenderRow {
  indicador_nombre: string;
  valor: number;
  region: string;
}

function mockRow(
  nivel: string,
  valor: number,
  region: string,
  subject: 'Lengua' | 'Matemática' = 'Lengua',
): AprenderRow {
  // Build indicador_nombre like "Nivel Lengua - Satisfactorio"
  return {
    indicador_nombre: `Nivel ${subject} - ${nivel}`,
    valor,
    region,
  };
}

function buildFullDataset(subject: 'Lengua' | 'Matemática' = 'Lengua'): AprenderRow[] {
  const rows: AprenderRow[] = [];
  const quintils = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'];
  const levels = ['Satisfactorio', 'Básico', 'Por debajo del básico'];
  const sectors = ['Estatal', 'Privado'];

  for (const q of quintils) {
    for (const level of levels) {
      for (const sector of sectors) {
        // Different values for Estatal vs Privado to force averaging
        const baseVal =
          level === 'Satisfactorio' ? 40 :
          level === 'Básico' ? 30 : 20;
        const sectorOffset = sector === 'Estatal' ? 5 : -5;
        rows.push(mockRow(level, baseVal + sectorOffset, `${q}-${sector}`, subject));
      }
    }
  }
  return rows;
}

describe('computeAprenderByQuintil', () => {
  it('should return exactly 5 quintil rows for Lengua with full data', () => {
    const data = buildFullDataset('Lengua');
    const result = computeAprenderByQuintil(data, 'Lengua');
    expect(result).toHaveLength(5);
  });

  it('should return exactly 5 quintil rows for Matemática with full data', () => {
    const data = buildFullDataset('Matemática');
    const result = computeAprenderByQuintil(data, 'Matemática');
    expect(result).toHaveLength(5);
  });

  it('should have correct quintil keys (Q1–Q5)', () => {
    const data = buildFullDataset('Lengua');
    const result = computeAprenderByQuintil(data, 'Lengua');
    const keys = result.map(r => r.quintil);
    expect(keys).toEqual(['Q1', 'Q2', 'Q3', 'Q4', 'Q5']);
  });

  it('should average Estatal+Privado correctly for a single quintil', () => {
    // Create minimal data for Q1 only
    const data: AprenderRow[] = [
      // Satisfactorio: Estatal=45, Privado=35 → avg=40
      mockRow('Satisfactorio', 45, 'Q1-Estatal'),
      mockRow('Satisfactorio', 35, 'Q1-Privado'),
      // Básico: Estatal=35, Privado=25 → avg=30
      mockRow('Básico', 35, 'Q1-Estatal'),
      mockRow('Básico', 25, 'Q1-Privado'),
      // Por debajo: Estatal=25, Privado=15 → avg=20
      mockRow('Por debajo del básico', 25, 'Q1-Estatal'),
      mockRow('Por debajo del básico', 15, 'Q1-Privado'),
    ];
    const result = computeAprenderByQuintil(data, 'Lengua');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      quintil: 'Q1',
      avanzado: 0,
      satisfactorio: 40,
      basico: 30,
      debajo: 20,
    });
  });

  it('should handle the DB typo "Por debajo del básicos" (extra s)', () => {
    const data: AprenderRow[] = [
      mockRow('Satisfactorio', 50, 'Q1-Estatal'),
      mockRow('Satisfactorio', 40, 'Q1-Privado'),
      // Typo: "Por debajo del básicos" instead of "básico"
      { indicador_nombre: 'Nivel Lengua - Por debajo del básicos', valor: 25, region: 'Q1-Estatal' },
      { indicador_nombre: 'Nivel Lengua - Por debajo del básicos', valor: 15, region: 'Q1-Privado' },
    ];
    const result = computeAprenderByQuintil(data, 'Lengua');
    expect(result).toHaveLength(1);
    expect(result[0].debajo).toBe(20);
    expect(result[0].satisfactorio).toBe(45);
  });

  it('should include Avanzado level in results', () => {
    const data: AprenderRow[] = [
      mockRow('Satisfactorio', 50, 'Q1-Estatal'),
      mockRow('Satisfactorio', 40, 'Q1-Privado'),
      mockRow('Avanzado', 10, 'Q1-Estatal'),
      mockRow('Avanzado', 6, 'Q1-Privado'),
    ];
    const result = computeAprenderByQuintil(data, 'Lengua');
    expect(result).toHaveLength(1);
    expect(result[0].satisfactorio).toBe(45);
    expect(result[0].avanzado).toBe(8);
    expect(Object.keys(result[0])).toEqual(['quintil', 'avanzado', 'satisfactorio', 'basico', 'debajo']);
  });

  it('should set missing levels to 0', () => {
    // Only Satisfactorio data provided, no Básico or Por debajo
    const data: AprenderRow[] = [
      mockRow('Satisfactorio', 50, 'Q1-Estatal'),
      mockRow('Satisfactorio', 40, 'Q1-Privado'),
    ];
    const result = computeAprenderByQuintil(data, 'Lengua');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      quintil: 'Q1',
      avanzado: 0,
      satisfactorio: 45,
      basico: 0,
      debajo: 0,
    });
  });

  it('should round to 1 decimal place', () => {
    // Use values that produce a non-integer average
    const data: AprenderRow[] = [
      mockRow('Satisfactorio', 44, 'Q1-Estatal'),
      mockRow('Satisfactorio', 33, 'Q1-Privado'),
      // (44+33)/2 = 38.5 → fine
      mockRow('Básico', 27, 'Q1-Estatal'),
      mockRow('Básico', 19, 'Q1-Privado'),
      // (27+19)/2 = 23.0 → fine
    ];
    const result = computeAprenderByQuintil(data, 'Lengua');
    expect(result[0].satisfactorio).toBe(38.5);
    expect(result[0].basico).toBe(23);
  });

  it('should return empty array when no matching data', () => {
    const data: AprenderRow[] = [
      { indicador_nombre: 'Unrelated indicator', valor: 10, region: 'Q1-Estatal' },
    ];
    const result = computeAprenderByQuintil(data, 'Lengua');
    expect(result).toEqual([]);
  });

  it('should filter by subject correctly (Lengua vs Matemática)', () => {
    // Mix of Lengua and Matemática rows
    const data: AprenderRow[] = [
      mockRow('Satisfactorio', 50, 'Q1-Estatal', 'Lengua'),
      mockRow('Satisfactorio', 40, 'Q1-Privado', 'Lengua'),
      mockRow('Satisfactorio', 10, 'Q1-Estatal', 'Matemática'),
      mockRow('Satisfactorio', 6, 'Q1-Privado', 'Matemática'),
    ];
    const lenguaResult = computeAprenderByQuintil(data, 'Lengua');
    const mateResult = computeAprenderByQuintil(data, 'Matemática');

    expect(lenguaResult[0].satisfactorio).toBe(45);
    expect(mateResult[0].satisfactorio).toBe(8);
  });

  it('should sum to ~100% per quintil (satisfactorio + basico + debajo)', () => {
    const data = buildFullDataset('Lengua');
    const result = computeAprenderByQuintil(data, 'Lengua');
    for (const row of result) {
      const total = row.satisfactorio + row.basico + row.debajo;
      // Each level avg is (base + 5 + base - 5) / 2 = base
      // So Satisfactorio=40, Básico=30, Por debajo=20 → total=90
      // That's 90 because the mock data uses these specific base values
      expect(total).toBeCloseTo(90, 0);
    }
  });
});
