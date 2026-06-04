/**
 * indicator-names — canonical DB-verified indicator names and lookup helpers.
 *
 * All string constants here match exact `indicador_nombre` values from the DB.
 * Pages import these instead of inline string literals to prevent silent
 * lookup failures due to name mismatches.
 *
 * Pure TS — no React deps. Follows inversion-constants.ts pattern.
 */

// ─── Canonical DB Names ──────────────────────────────────────────
// These are VERIFIED against SELECT DISTINCT indicador_nombre WHERE activo = true
export const INDICATOR_NAMES = {
  // Pobreza INDEC
  POBREZA_HOGARES: 'Pobreza hogares',
  POBREZA_PERSONAS: 'Pobreza personas',
  INDIGENCIA_HOGARES: 'Indigencia (hogares)',
  INDIGENCIA_PERSONAS: 'Indigencia (personas)',
  TASA_DESEMPLEO: 'Tasa de desempleo',

  // Pobreza UCA
  POBREZA_MONETARIA_PERSONAS: 'Pobreza monetaria (personas)',
  POBREZA_MONETARIA_HOGARES: 'Pobreza monetaria (hogares)',
  POBREZA_MULTIDIMENSIONAL: 'Pobreza multidimensional (2+ carencias)',
  INSEGURIDAD_ALIMENTARIA_TOTAL: 'Inseguridad alimentaria total',
  INSEGURIDAD_ALIMENTARIA_NNYA: 'Inseguridad alimentaria total (NNyA)',
  INSEGURIDAD_ALIMENTARIA_SEVERA_NNYA: 'Inseguridad alimentaria severa (NNyA)',

  // Salud
  NACIMIENTOS_ADOLESCENTES: 'Nacimientos adolescentes',
  TMI_CBA: 'Mortalidad infantil (TMI Cba)',
  TMI_NAC: 'Mortalidad infantil (TMI)',
  TMI_RMM_CBA: 'Mortalidad infantil (RMM Cba)',
  TMI_RMM: 'Mortalidad infantil (RMM)',
  TASA_FECUNDIDAD_ADOLESCENTE: 'Tasa fecundidad adolescente',

  // Educación
  TASA_ASISTENCIA_EDUCATIVA: 'Tasa de asistencia educativa',
  MATRICULA_GENERAL: 'Matrícula - General',
  MATRICULA_SECTOR_ESTATAL: 'Matrícula sector estatal - General',
  MATRICULA_TOTAL: 'Matrícula Total',
  UNIDADES_EDUCATIVAS: 'Unidades educativas - General',

  // Seguridad
  CASOS_VIOLENCIA_FAMILIAR: 'Casos de Violencia Familiar',
  TOTAL_CASOS_JUSTICIA: 'Total casos sistema de justicia',
} as const;

export type IndicatorName = (typeof INDICATOR_NAMES)[keyof typeof INDICATOR_NAMES];

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * All known indicator name values for searching.
 * Built once from INDICATOR_NAMES for efficient includes() matching.
 */
const ALL_KNOWN_NAMES: readonly string[] = Object.values(INDICATOR_NAMES);

/**
 * Case-insensitive includes() search across ALL known indicator names.
 * Returns the canonical (exact DB) name if found, or undefined.
 *
 * This is the recommended way to resolve user-facing keywords or
 * short labels to their exact DB counterparts.
 *
 * @example indicatorName('TMI Cba') → 'Mortalidad infantil (TMI Cba)'
 * @example indicatorName('inexistente') → undefined
 * @example indicatorName('POBREZA PERSONAS') → 'Pobreza personas'
 */
export function indicatorName(keyword: string): string | undefined {
  if (!keyword) return undefined;
  const lower = keyword.toLowerCase();
  return ALL_KNOWN_NAMES.find(name => name.toLowerCase().includes(lower));
}

/**
 * Format an absolute (difference) change value with the appropriate
 * unit label based on the indicator's unidad field.
 *
 * - unidad '%' → suffix is 'pp' (percentage points)
 * - unidad '‰' → suffix is '‰' (per mille stays as-is)
 * - default → raw unidad value as suffix
 *
 * Always includes sign prefix. Returns undefined for null/undefined diff.
 *
 * @example formatChangeLabel(1.5, '%') → '+1.5 pp'
 * @example formatChangeLabel(-0.3, '‰') → '-0.3‰'
 * @example formatChangeLabel(0, '%') → '+0.0 pp'
 */
export function formatChangeLabel(diff: number | null | undefined, unidad: string): string | undefined {
  if (diff === null || diff === undefined) return undefined;
  const prefix = diff >= 0 ? '+' : '';
  const suffix = unidad === '%' ? 'pp' : unidad;
  return `${prefix}${diff.toFixed(1)} ${suffix}`.trim();
}
