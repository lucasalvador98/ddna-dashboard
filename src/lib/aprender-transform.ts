/**
 * aprender-transform — pure functions for transforming Aprender DB data
 * into quintil-aggregated chart data.
 *
 * DB schema: categoria='aprender', each row = one nivel × quintil × sector
 *   - indicador_nombre: 'Nivel Lengua - Satisfactorio' (or Matemática)
 *   - region: 'Q1-Estatal', 'Q1-Privado', etc.
 *   - valor: percentage of students at that level
 *
 * Chart expects: 5 rows (Q1–Q5), one per quintil, with 3 levels aggregated.
 */

// ─── Types ──────────────────────────────────────────────────────

export interface AprenderRow {
  indicador_nombre: string;
  valor: number;
  region: string;
}

export interface AprenderPorQuintil {
  quintil: string;
  avanzado: number;
  satisfactorio: number;
  basico: number;
  debajo: number;
}

// ─── Level mapping ──────────────────────────────────────────────

/**
 * Normalize level names from DB to our internal keys.
 * - 'Avanzado' → 'avanzado'
 * - 'Satisfactorio' → 'satisfactorio'
 * - 'Básico' → 'basico'
 * - 'Por debajo del básico' (or the DB typo 'básicos') → 'debajo'
 */
function mapLevel(name: string): 'avanzado' | 'satisfactorio' | 'basico' | 'debajo' | undefined {
  const lower = name.toLowerCase();

  if (lower === 'avanzado') {
    return 'avanzado';
  }
  if (lower === 'satisfactorio' || lower.startsWith('satisfactorio')) {
    return 'satisfactorio';
  }
  if (lower === 'básico' || lower === 'basico') {
    return 'basico';
  }
  // Handles both 'por debajo del básico' and the DB typo 'por debajo del básicos'
  if (lower.includes('por debajo del básico') || lower.includes('por debajo del basico')) {
    return 'debajo';
  }
  return undefined;
}

// ─── Main transform ─────────────────────────────────────────────

/**
 * Compute per-quintil aggregates from raw Aprender DB rows.
 *
 * For each quintil, averages Estatal + Privado sector values per level,
 * then pivots to { quintil, satisfactorio, basico, debajo }.
 *
 * @param data - Raw rows from categoria='aprender'
 * @param subject - 'Lengua' | 'Matemática' — matches "Nivel {subject} - {level}"
 * @returns 0–5 rows (Q1–Q5), sorted ascending, with values rounded to 1 decimal
 */
export function computeAprenderByQuintil(
  data: AprenderRow[],
  subject: 'Lengua' | 'Matemática',
): AprenderPorQuintil[] {
  const prefix = `Nivel ${subject} - `;

  // ── 1. Filter rows for this subject ───────────────────────────
  const filtered = data.filter(row =>
    row.indicador_nombre?.toLowerCase().startsWith(prefix.toLowerCase()),
  );
  if (filtered.length === 0) return [];

  // ── 2. Group by (quintil, level) and accumulate ───────────────
  // key: `${quintil}|${levelKey}` → { sum, count }
  const groups = new Map<string, { sum: number; count: number }>();

  for (const row of filtered) {
    // Extract level name after the prefix
    const levelLabel = row.indicador_nombre.slice(prefix.length).trim();
    const levelKey = mapLevel(levelLabel);
    if (!levelKey) continue; // Skip Avanzado and unknown

    // Extract quintil from region like 'Q1-Estatal', 'Q1-Privado'
    const quintil = extractQuintil(row.region);
    if (!quintil) continue;

    const groupKey = `${quintil}|${levelKey}`;
    const existing = groups.get(groupKey);
    if (existing) {
      existing.sum += row.valor;
      existing.count += 1;
    } else {
      groups.set(groupKey, { sum: row.valor, count: 1 });
    }
  }

  // ── 3. Group by quintil and pivot to levels ───────────────────
  const quintilsMap = new Map<string, { avanzado: number; satisfactorio: number; basico: number; debajo: number }>();

  for (const [groupKey, { sum, count }] of groups) {
    const [quintil, levelKey] = groupKey.split('|') as [string, 'avanzado' | 'satisfactorio' | 'basico' | 'debajo'];
    const avg = round1(sum / count);

    if (!quintilsMap.has(quintil)) {
      quintilsMap.set(quintil, { avanzado: 0, satisfactorio: 0, basico: 0, debajo: 0 });
    }
    quintilsMap.get(quintil)![levelKey] = avg;
  }

  // ── 4. Sort by quintil number ─────────────────────────────────
  const sortedQuintils = [...quintilsMap.entries()].sort(([a], [b]) => {
    const numA = parseInt(a.replace('Q', ''), 10);
    const numB = parseInt(b.replace('Q', ''), 10);
    return numA - numB;
  });

  return sortedQuintils.map(([quintil, values]) => ({
    quintil,
    ...values,
  }));
}

// ─── Helpers ────────────────────────────────────────────────────

/**
 * Extract quintil from region string like 'Q1-Estatal', 'Q5-Privado'.
 * Returns e.g. 'Q1' or null if not found.
 */
function extractQuintil(region: string | undefined | null): string | null {
  if (!region) return null;
  const match = region.match(/^(Q[1-5])(-|$)/);
  return match?.[1] ?? null;
}

/**
 * Round to 1 decimal place, handling floating point precision.
 */
function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
