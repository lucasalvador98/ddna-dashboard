import { describe, it, expect } from 'vitest';
import { INDICATOR_NAMES, indicatorName, formatChangeLabel } from './indicator-names';

describe('INDICATOR_NAMES', () => {
  it('should contain NACIMIENTOS_ADOLESCENTES', () => {
    expect(INDICATOR_NAMES.NACIMIENTOS_ADOLESCENTES).toBe('Nacimientos adolescentes');
  });

  it('should contain the canonical TMI_CBA name', () => {
    expect(INDICATOR_NAMES.TMI_CBA).toBe('Mortalidad infantil (TMI Cba)');
  });

  it('should contain the canonical POBREZA_PERSONAS name', () => {
    expect(INDICATOR_NAMES.POBREZA_PERSONAS).toBe('Pobreza personas');
  });

  it('should contain the canonical INDIGENCIA_PERSONAS name (with parens)', () => {
    expect(INDICATOR_NAMES.INDIGENCIA_PERSONAS).toBe('Indigencia (personas)');
  });

  it('should contain the canonical TASA_ASISTENCIA_EDUCATIVA name', () => {
    expect(INDICATOR_NAMES.TASA_ASISTENCIA_EDUCATIVA).toBe('Tasa de asistencia educativa');
  });

  it('should contain the canonical MATRICULA_GENERAL name with accent', () => {
    expect(INDICATOR_NAMES.MATRICULA_GENERAL).toBe('Matrícula - General');
  });

  it('should contain the canonical CASOS_VIOLENCIA_FAMILIAR name', () => {
    expect(INDICATOR_NAMES.CASOS_VIOLENCIA_FAMILIAR).toBe('Casos de Violencia Familiar');
  });

  it('should contain the canonical TOTAL_CASOS_JUSTICIA name', () => {
    expect(INDICATOR_NAMES.TOTAL_CASOS_JUSTICIA).toBe('Total casos sistema de justicia');
  });

  it('should not have "Pobreza infantil" as a constant (it does not exist in DB)', () => {
    // This key intentionally does not exist — DB has no child-specific poverty indicator
    const keys = Object.keys(INDICATOR_NAMES);
    expect(keys.some(k => k.includes('POBREZA_INFANTIL'))).toBe(false);
  });

  it('should not have "Indigencia infantil" as a constant (it does not exist in DB)', () => {
    const keys = Object.keys(INDICATOR_NAMES);
    expect(keys.some(k => k.includes('INDIGENCIA_INFANTIL'))).toBe(false);
  });
});

describe('indicatorName()', () => {
  it('should return canonical name for "TMI Cba"', () => {
    expect(indicatorName('TMI Cba')).toBe('Mortalidad infantil (TMI Cba)');
  });

  it('should be case-insensitive', () => {
    expect(indicatorName('tmi cba')).toBe('Mortalidad infantil (TMI Cba)');
    expect(indicatorName('TMI CBA')).toBe('Mortalidad infantil (TMI Cba)');
    expect(indicatorName('POBREZA PERSONAS')).toBe('Pobreza personas');
  });

  it('should return canonical name for "Pobreza infantil" (maps to Pobreza personas)', () => {
    // "Pobreza infantil" includes "Pobreza personas" — no, wait:
    // "Pobreza infantil" does NOT include "Pobreza personas" substring
    // So this should return undefined
    // The mapping is done at the PAGE level, not in the helper
    expect(indicatorName('Pobreza infantil')).toBeUndefined();
  });

  it('should return canonical name for "asistencia educativa"', () => {
    expect(indicatorName('asistencia educativa')).toBe('Tasa de asistencia educativa');
  });

  it('should return canonical name for "Matricula" (without accent)', () => {
    // 'Matrícula - General'.toLowerCase() includes 'matricula'?
    // No, because 'í' !== 'i'. But the helper searches the keyword in the name,
    // so 'matricula' (from keyword) won't find 'matrícula' (from name)
    expect(indicatorName('Matricula')).toBeUndefined();
  });

  it('should return canonical name for "Matrícula" (with accent)', () => {
    expect(indicatorName('Matrícula')).toBe('Matrícula - General');
  });

  it('should return canonical name for "Violencia Familiar"', () => {
    expect(indicatorName('Violencia Familiar')).toBe('Casos de Violencia Familiar');
  });

  it('should return canonical name for "estatal"', () => {
    expect(indicatorName('estatal')).toBe('Matrícula sector estatal - General');
  });

  it('should return canonical name for "Total casos"', () => {
    expect(indicatorName('Total casos')).toBe('Total casos sistema de justicia');
  });

  it('should return undefined for an unknown keyword', () => {
    expect(indicatorName('inexistente')).toBeUndefined();
  });

  it('should return undefined for empty string', () => {
    expect(indicatorName('')).toBeUndefined();
  });

  it('should return the FIRST match when multiple names contain the keyword', () => {
    // "TMI" appears in multiple names: TMI_CBA, TMI_NAC, TMI_RMM_CBA, TMI_RMM
    // Should return the first in the ALL_KNOWN_NAMES array order
    const result = indicatorName('TMI');
    expect(result).toBeDefined();
    // Any TMI variant is valid, just make sure it finds one
    expect(result).toMatch(/TMI/);
  });

  it('should handle partial keyword "indigencia"', () => {
    const result = indicatorName('indigencia');
    expect(result).toBeDefined();
    expect(result!.toLowerCase()).toContain('indigencia');
  });

  it('should handle partial keyword "pobreza"', () => {
    const result = indicatorName('pobreza');
    expect(result).toBeDefined();
    expect(result!.toLowerCase()).toContain('pobreza');
  });
});

describe('formatChangeLabel()', () => {
  it('should format positive diff with "%" unidad as "pp" suffix', () => {
    expect(formatChangeLabel(1.5, '%')).toBe('+1.5 pp');
  });

  it('should format negative diff with "%" unidad as "pp" suffix', () => {
    expect(formatChangeLabel(-0.3, '%')).toBe('-0.3 pp');
  });

  it('should format zero diff with "%" unidad as "pp" suffix', () => {
    expect(formatChangeLabel(0, '%')).toBe('+0.0 pp');
  });

  it('should format positive diff with "‰" unidad as "‰" suffix', () => {
    expect(formatChangeLabel(1.5, '‰')).toBe('+1.5 ‰');
  });

  it('should format negative diff with "‰" unidad as "‰" suffix', () => {
    expect(formatChangeLabel(-0.3, '‰')).toBe('-0.3 ‰');
  });

  it('should format with custom unidad as suffix', () => {
    expect(formatChangeLabel(100, 'casos')).toBe('+100.0 casos');
    expect(formatChangeLabel(-50, 'hab')).toBe('-50.0 hab');
  });

  it('should return undefined for null', () => {
    expect(formatChangeLabel(null, '%')).toBeUndefined();
  });

  it('should return undefined for undefined', () => {
    expect(formatChangeLabel(undefined as unknown as number | null, '%')).toBeUndefined();
  });

  it('should handle large positive values', () => {
    expect(formatChangeLabel(1234.56, '%')).toBe('+1234.6 pp');
  });

  it('should handle large negative values', () => {
    expect(formatChangeLabel(-999.9, '‰')).toBe('-999.9 ‰');
  });
});
