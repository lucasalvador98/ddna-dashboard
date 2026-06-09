/**
 * format-inversion — shared formatting & aggregation utilities for inversion data.
 *
 * All functions are pure — no side effects, no React deps.
 * Designed to be used by both homepage and inversion page for consistency.
 */
import {
  CHILD_RELEVANT_CATEGORIES,
  EDUCATION_CATEGORY_FRAGMENTS,
  HEALTH_CATEGORY_FRAGMENTS,
  SCALE_FACTOR,
  SCALE_LABEL,
} from './inversion-constants';
import type { Indicador } from './use-dashboard-data';

// ———————————————————————————————————————————————
// Formatting
// ———————————————————————————————————————————————

/**
 * Format a raw peso value as a human-readable string in millions (Md).
 * Returns "$—" for zero, negative, or null-like values.
 *
 * @example formatInversionValue(45_200_000_000) → "$45,200.0 Md"
 */
export function formatInversionValue(val: number): string {
  if (!val || val <= 0) return '$—';
  const inMillions = val / SCALE_FACTOR;
  // Use en-US locale for consistent comma as thousand sep, dot as decimal
  const formatted = inMillions.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return `$${formatted} ${SCALE_LABEL}`;
}

/**
 * Format a percentage change value.
 * Returns undefined for null/undefined inputs (hides the badge).
 *
 * @example formatInversionChange(12.3) → "+12.3%"
 * @example formatInversionChange(-5.7) → "-5.7%"
 * @example formatInversionChange(null) → undefined
 */
export function formatInversionChange(cambio: number | null | undefined): string | undefined {
  if (cambio === null || cambio === undefined) return undefined;
  const prefix = cambio >= 0 ? '+' : '';
  return `${prefix}${cambio.toFixed(1)}%`;
}

// ———————————————————————————————————————————————
// Category matching
// ———————————————————————————————————————————————

/**
 * Check if a category name matches any education-related fragment.
 * Case-insensitive substring matching.
 */
export function isEducacionCategory(name: string): boolean {
  if (!name) return false;
  const lower = name.toLowerCase();
  return EDUCATION_CATEGORY_FRAGMENTS.some(f => lower.includes(f));
}

/**
 * Check if a category name matches any health-related fragment.
 * Case-insensitive substring matching.
 */
export function isSaludCategory(name: string): boolean {
  if (!name) return false;
  const lower = name.toLowerCase();
  return HEALTH_CATEGORY_FRAGMENTS.some(f => lower.includes(f));
}

// ———————————————————————————————————————————————
// Aggregation
// ———————————————————————————————————————————————

/**
 * Sum all inversion values for child-relevant categories in a given period.
 * If no period is specified, uses the latest available period.
 * If categories are specified, uses those instead of CHILD_RELEVANT_CATEGORIES.
 */
export function getInversionTotal(
  inversionData: Indicador[],
  latestPeriod?: string,
  categories?: string[]
): number {
  if (!inversionData || inversionData.length === 0) return 0;

  // Determine the period to filter by
  const period = latestPeriod ?? extractLatestPeriod(inversionData);
  if (!period) return 0;

  const targetCategories = categories ?? CHILD_RELEVANT_CATEGORIES;

  return inversionData
    .filter(ind => {
      if (ind.periodo !== period) return false;
      const cat = getCategoria(ind);
      if (!cat) return false;
      return targetCategories.some(rc => cat.includes(rc));
    })
    .reduce((sum, ind) => sum + Number(ind.valor || 0), 0);
}

/**
 * Group inversion values by category for a given period.
 * Returns sorted array of { name, value } descending by value.
 * If no period is specified, uses the latest available period.
 */
export function getInversionByCategory(
  inversionData: Indicador[],
  latestPeriod?: string
): { name: string; value: number }[] {
  if (!inversionData || inversionData.length === 0) return [];

  const period = latestPeriod ?? extractLatestPeriod(inversionData);
  if (!period) return [];

  const porArea = new Map<string, number>();

  for (const d of inversionData) {
    if (d.periodo !== period) continue;
    const area = getCategoria(d) || 'Sin categoría';
    porArea.set(area, (porArea.get(area) || 0) + Number(d.valor));
  }

  return Array.from(porArea.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

// ———————————————————————————————————————————————
// Internal helpers
// ———————————————————————————————————————————————

/**
 * Extract the latest period from an array of Indicador items.
 * Periods are sorted as strings (lexicographic: "2023" < "2024").
 */
function extractLatestPeriod(data: Indicador[]): string | undefined {
  if (!data || data.length === 0) return undefined;
  return [...data].sort((a, b) => b.periodo.localeCompare(a.periodo))[0]?.periodo;
}

/**
 * Safely extract categoria from desglose, handling the triple-encoded JSONB.
 * Checks desglose.area first (new ponderador pipeline), then desglose.categoria (legacy).
 */
function getCategoria(ind: Indicador): string {
  // New data stores area in desglose.area
  const area = ind.desglose?.area;
  if (typeof area === 'string' && area) return area;
  // Fallback for legacy data with desglose.categoria
  const raw = ind.desglose?.categoria;
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object' && raw !== null) return String(raw);
  return '';
}
