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
  TMNEO_CBA: 'Mortalidad infantil (TMNEO Cba)',
  TMPOS_CBA: 'Mortalidad infantil (TMPOS cba)',
  TASA_FECUNDIDAD_ADOLESCENTE: 'Tasa fecundidad adolescente',

  // Vacunación — Coberturas nacionales
  DPT3_NACIONAL: 'Cobertura DPT3 - Nacional',
  DPT4_NACIONAL: 'Cobertura DPT4 - Nacional',
  SRP1_NACIONAL: 'Cobertura SRP1 - Nacional',
  SRP2_NACIONAL: 'Cobertura SRP2 - Nacional',
  PCV13_NACIONAL: 'Cobertura PCV13 - Nacional',
  TRIPLE_VIRAL: 'Cobertura Triple Viral (SRP) - 1ra dosis',

  // Vacunación — Por quintil
  DPT4_QUINTIL_1: 'Cobertura DPT4 - Quintil 1 (mayor pobreza)',
  DPT4_QUINTIL_5: 'Cobertura DPT4 - Quintil 5 (menor pobreza)',

  // Vacunación — Córdoba
  DPT4_CORDOBA: 'Cobertura DPT4 - Córdoba',
  SRP2_CORDOBA: 'Cobertura SRP2 - Córdoba',
  DPT_ESCOLAR_CORDOBA: 'Cobertura DPT escolar - Córdoba',

  // Vacunación — Esquemas incompletos
  ESQUEMAS_INCOMPLETOS: 'Esquemas incompletos <1 año',
  SIN_DPT4_REFUERZO: 'Sin DPT4 refuerzo',
  SIN_SRP1_HAV: 'Sin SRP1 y Hepatitis A',
  SIN_PCV13: 'Sin refuerzo PCV13',

  // UCA-ODSA dimensiones
  UCA_INSEGURIDAD_ALIMENTARIA: 'Inseguridad alimentaria total (personas)',
  UCA_INSEGURIDAD_ALIMENTARIA_SEVERA: 'Inseguridad alimentaria severa (personas)',
  UCA_NO_FESTEJO_CUMPLE: 'No festejó el ultimo cumpleaños',
  UCA_NO_CUENTOS_FAMILIA: 'No suele compartir cuentos y lecturas en familia',
  UCA_NO_INTERNET: 'No suele usar internet',
  UCA_NO_LEE_TEXTOS: 'No suele leer textos impresos',
  UCA_DESSEMPEÑO: 'Desempleo',
  UCA_EMPLEO_PLENO: 'Empleo pleno de derechos',
  UCA_EMPLEO_NO_REGISTRADO: 'Trabajo no registrado en la Seguridad Social',
  UCA_HACINAMIENTO: 'Hacinamiento',
  UCA_CALLES_SIN_PAVIMENTAR: 'Calles sin pavimentar',
  UCA_BASURALES: 'Con basurales cerca de la vivienda',
  UCA_VIVIENDA_PRECARIA: 'Vivienda precaria',
  UCA_POBREZA_PERSONAS: 'Situación de pobreza (personas)',
  UCA_INDIGENCIA_PERSONAS: 'Situación de indigencia (personas)',

  // Educación
  TASA_ASISTENCIA_EDUCATIVA: 'Tasa de asistencia educativa',
  MATRICULA_GENERAL: 'Matrícula - General',
  MATRICULA_SECTOR_ESTATAL: 'Matrícula sector estatal - General',
  MATRICULA_TOTAL: 'Matrícula Total',
  UNIDADES_EDUCATIVAS: 'Unidades educativas - General',

  // Seguridad
  CASOS_VIOLENCIA_FAMILIAR: 'Casos de Violencia Familiar',
  TOTAL_CASOS_JUSTICIA: 'Total casos sistema de justicia',
  TENTATIVAS_HURTO: 'Tentativas de hurto',
  TASA_TENTATIVAS_HURTO: 'Tasa de tentativas de hurto',
  CONTRAVENCIONES: 'Contravenciones',
  ROBOS_TENTATIVA_ROBO: 'Robos y tentativa de robo',
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
export function formatChangeLabel(
  diff: number | null | undefined,
  unidad: string
): string | undefined {
  if (diff === null || diff === undefined) return undefined;
  const prefix = diff >= 0 ? '+' : '';
  const suffix = unidad === '%' ? 'pp' : unidad;
  return `${prefix}${diff.toFixed(1)} ${suffix}`.trim();
}
