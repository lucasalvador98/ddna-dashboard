/**
 * inversion-constants — shared constants for inversion data processing.
 *
 * These are used by both useDashboardData (server-side filtering) and
 * the inversion page (client-side display). Pure TS, no React deps.
 */

/** Scale factor: raw pesos → millions */
export const SCALE_FACTOR = 1_000_000;

/** Display label for the scale unit */
export const SCALE_LABEL = 'millones';

/**
 * Full category names that are directly relevant to childhood/adolescence.
 * Used by getInversionTotal and getInversionInversion to filter.
 *
 * Includes both old fine-grained categories AND the new high-level areas
 * from the ponderador-based pipeline (desglose.area).
 */
export const CHILD_RELEVANT_CATEGORIES: string[] = [
  // New high-level areas (post-ponderador migration)
  'Educación',
  'Salud',
  'Desarrollo Social',
  'Niñez y Adolescencia',
  // Legacy fine-grained categories
  'Educación básica (inicial, elemental y media)',
  'Comedores escolares y copa de leche',
  'Niños en riesgo',
  'Transporte escolar',
  'Materno-infantil',
  'Transferencias de ingresos a las familias',
  'Calidad educativa, gestión curricular y capacitaci',
  'Trabajo infantil',
  'Atención ambulatoria e internación',
  'Prevención de enfermedades y riesgos específicos',
  'Deporte y recreación',
  'Atención de grupos vulnerables',
  'Violencia familiar',
];

/**
 * Substring fragments for matching education-related categories.
 * Used by isEducacionCategory() for KPI extraction.
 */
export const EDUCATION_CATEGORY_FRAGMENTS: string[] = ['educación', 'calidad educativa'];

/**
 * Substring fragments for matching health-related categories.
 * Used by isSaludCategory() for KPI extraction.
 */
export const HEALTH_CATEGORY_FRAGMENTS: string[] = [
  'salud',
  'materno-infantil',
  'atención ambulatoria',
  'prevención de enfermedades',
];
