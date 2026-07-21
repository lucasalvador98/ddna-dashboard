/**
 * parseDesglose — normalizes the double-encoded JSONB `desglose` column.
 *
 * Problem: The `indicadores.desglose` column (JSONB) stores a JSON STRING instead
 * of a JSON object. Supabase JS client returns it as a JavaScript string like
 * `"{\\"categoria\\": \\"Educación\\", ...}"`, NOT a parsed object.
 *
 * This utility parses it into a proper Record<string, unknown> so that
 * `desglose.categoria`, `desglose.semestre`, etc. work as expected.
 */
export function parseDesglose(raw: unknown): Record<string, unknown> {
  if (!raw) return {};

  // Already a plain object — check for nested stringified values
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        try {
          result[key] = JSON.parse(value);
        } catch {
          result[key] = value;
        }
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  // String — parse as JSON
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
      return {};
    } catch {
      return {};
    }
  }

  return {};
}
