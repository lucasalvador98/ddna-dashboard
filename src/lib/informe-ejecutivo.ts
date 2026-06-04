/**
 * informe-ejecutivo — Data aggregation, prompt builder, and multi-source search
 * helpers for AI executive / critical reports.
 *
 * Pure functions / helpers — no React. Designed for testability.
 */

import { INDICATOR_NAMES } from './indicator-names';

// ─── Types ──────────────────────────────────────────────────────

/** Row shape from the indicadores view (or direct table query). */
export interface IndicadorRow {
  id: string;
  indicador_nombre: string;
  categoria: string;
  valor: number;
  unidad: string;
  periodo: string;
  region: string;
  desglose: Record<string, unknown>;
  fuente?: string;
}

/** Data payload sent to gpt-4o-mini for analysis. */
export interface ReportPayload {
  generatedAt: string;
  categories: Record<
    string,
    {
      indicators: Array<{
        name: string;
        values: Array<{
          periodo: string;
          valor: number;
          unidad: string;
          fuente?: string;
        }>;
      }>;
    }
  >;
}

/** Single highlight item in a report section. */
export interface ReportHighlight {
  type: 'positive' | 'negative' | 'neutral';
  text: string;
}

/** One section of the report (one category). */
export interface ReportSection {
  category: string;
  title: string;
  analysis: string;
  highlights: ReportHighlight[];
}

/** The full executive report structure returned by gpt-4o-mini. */
export interface ExecutiveReport {
  title: string;
  date: string;
  overview: string;
  sections: ReportSection[];
  conclusion: string;
  recommendations: string[];
}

// ─── Critical Report Types (multi-source) ─────────────────────────

/** Data quality assessment for a single category. */
export interface DataQuality {
  category: string;
  rating: 'alta' | 'media' | 'baja';
  issues: string[];
}

/** A cross-reference from one of the three sources. */
export interface CrossReference {
  source: 'documento' | 'web' | 'indicador';
  title: string;
  content: string;
  relevance: string;
}

/** A discrepancy detected between sources. */
export interface Discrepancy {
  description: string;
  sources: string[];
  severity: 'alta' | 'media' | 'baja';
}

/** Extended report with critical analysis fields. */
export interface CriticalReport extends ExecutiveReport {
  dataQuality: DataQuality[];
  discrepancies: Discrepancy[];
  crossReferences: CrossReference[];
  suggestedImprovements: string[];
}

// ─── Key indicators per category ───────────────────────────────

/** Known categories in the DDNA dashboard. */
export const ALL_CATEGORIES = [
  'pobreza',
  'salud',
  'educacion',
  'inversion',
  'seguridad',
  'demografia',
] as const;

export type Category = (typeof ALL_CATEGORIES)[number];

/**
 * Map of category → list of canonical INDICATOR_NAMES keys.
 * Categories not listed include ALL their indicators.
 */
export const CATEGORY_KEY_INDICATORS: Record<string, readonly string[]> = {
  pobreza: [
    INDICATOR_NAMES.POBREZA_HOGARES,
    INDICATOR_NAMES.POBREZA_PERSONAS,
    INDICATOR_NAMES.INDIGENCIA_HOGARES,
    INDICATOR_NAMES.INDIGENCIA_PERSONAS,
    INDICATOR_NAMES.TASA_DESEMPLEO,
    INDICATOR_NAMES.POBREZA_MONETARIA_PERSONAS,
    INDICATOR_NAMES.POBREZA_MONETARIA_HOGARES,
    INDICATOR_NAMES.POBREZA_MULTIDIMENSIONAL,
    INDICATOR_NAMES.INSEGURIDAD_ALIMENTARIA_TOTAL,
    INDICATOR_NAMES.INSEGURIDAD_ALIMENTARIA_NNYA,
    INDICATOR_NAMES.INSEGURIDAD_ALIMENTARIA_SEVERA_NNYA,
  ],
  salud: [
    INDICATOR_NAMES.NACIMIENTOS_ADOLESCENTES,
    INDICATOR_NAMES.TMI_CBA,
    INDICATOR_NAMES.TMI_NAC,
    INDICATOR_NAMES.TMI_RMM_CBA,
    INDICATOR_NAMES.TMI_RMM,
    INDICATOR_NAMES.TASA_FECUNDIDAD_ADOLESCENTE,
  ],
  educacion: [
    INDICATOR_NAMES.TASA_ASISTENCIA_EDUCATIVA,
    INDICATOR_NAMES.MATRICULA_GENERAL,
    INDICATOR_NAMES.MATRICULA_SECTOR_ESTATAL,
    INDICATOR_NAMES.MATRICULA_TOTAL,
    INDICATOR_NAMES.UNIDADES_EDUCATIVAS,
  ],
  seguridad: [
    INDICATOR_NAMES.CASOS_VIOLENCIA_FAMILIAR,
    INDICATOR_NAMES.TOTAL_CASOS_JUSTICIA,
  ],
};

// ─── Helpers ────────────────────────────────────────────────────

/** Simple period comparison (handles "2024", "2024-S2", etc.). */
function comparePeriodo(a: string, b: string): number {
  const aYear = parseInt(a.match(/^\d{4}/)?.[0] || '0', 10);
  const bYear = parseInt(b.match(/^\d{4}/)?.[0] || '0', 10);
  if (aYear !== bYear) return aYear - bYear;
  return a.localeCompare(b);
}

/**
 * Check if an indicator name is a "key indicator" for the given category.
 * If the category has no key list, ALL indicators are included.
 */
function isKeyIndicator(name: string, category: string): boolean {
  const keys = CATEGORY_KEY_INDICATORS[category];
  if (!keys || keys.length === 0) return true; // include all
  return keys.some(key => name.toLowerCase().includes(key.toLowerCase()));
}

// ─── Multi-source Search Helpers ────────────────────────────────

/**
 * Search the doc_chunks table for excerpts related to a category.
 * Tries the category name and up to 3 key indicator names for the category.
 * Returns max `maxResults` results.
 */
export async function searchDocuments(
  supabaseClient: unknown,
  category: string,
  maxResults: number = 3,
): Promise<{ title: string; content: string }[]> {
  const keyIndicators = CATEGORY_KEY_INDICATORS[category] || [];
  const searchTerms = [category, ...keyIndicators.slice(0, 3)];

  const results: { title: string; content: string }[] = [];

  // Cast to minimal queryable shape — safe because Supabase's client
  // structually matches { from → select → ilike → limit }
  const db = supabaseClient as {
    from(table: string): {
      select(cols: string): {
        ilike(col: string, pattern: string): {
          limit(n: number): Promise<{ data: unknown[] | null; error: unknown }>;
        };
      };
    };
  };

  for (const term of searchTerms) {
    if (results.length >= maxResults) break;

    const { data, error } = await db
      .from('doc_chunks')
      .select('content, metadata')
      .ilike('content', `%${term}%`)
      .limit(maxResults - results.length);

    if (error) {
      console.warn(`searchDocuments error for term "${term}":`, error);
      continue;
    }

    if (data) {
      for (const raw of data) {
        const row = (raw ?? {}) as Record<string, unknown>;
        const metadata = (row.metadata ?? {}) as Record<string, unknown>;
        const title =
          (metadata?.source as string) ||
          (metadata?.fileName as string) ||
          'Documento';
        const content =
          typeof row.content === 'string'
            ? (row.content as string).substring(0, 500)
            : String(row.content ?? '').substring(0, 500);
        results.push({ title, content });

        if (results.length >= maxResults) break;
      }
    }
  }

  return results;
}

/**
 * Search the web via DuckDuckGo HTML scraper for context on a category.
 * Returns max `maxResults` results. Guarantees graceful fallback on error.
 */
export async function searchWebContext(
  category: string,
  maxResults: number = 3,
): Promise<{ title: string; snippet: string; url: string }[]> {
  const query = encodeURIComponent(
    `indicadores ${category} niños niñas adolescentes Argentina`,
  );

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      `https://html.duckduckgo.com/html/?q=${query}`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DDNA-Bot/1.0)' },
        signal: controller.signal,
      },
    );
    clearTimeout(timeout);

    const html = await response.text();

    // Parse basic results from HTML (simple regex approach)
    const results: { title: string; snippet: string; url: string }[] = [];
    const snippetRegex =
      /<a rel="nofollow" class="result__a" href="([^"]+)">([^<]*)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([^<]*)<\/a>/g;
    let match;
    while ((match = snippetRegex.exec(html)) !== null && results.length < maxResults) {
      results.push({
        url: match[1],
        title: match[2].replace(/<[^>]+>/g, '').trim(),
        snippet: match[3].replace(/<[^>]+>/g, '').trim(),
      });
    }

    return results;
  } catch {
    // Graceful fallback — DDG may be blocked in some environments
    return [];
  }
}

// ─── Public API ─────────────────────────────────────────────────

/**
 * Build the structured data payload to send to gpt-4o-mini.
 *
 * Groups indicators by category, keeps at most the latest 3 periods
 * per indicator, and filters to key indicators for known categories.
 *
 * @param categories Categories to include. Empty array = all.
 * @param data All indicator rows from Supabase.
 */
export function buildReportPayload(
  categories: string[],
  data: IndicadorRow[],
): ReportPayload {
  const activeCategories =
    categories.length > 0
      ? categories.filter((c) => ALL_CATEGORIES.includes(c as Category))
      : [...ALL_CATEGORIES];

  // Group by category
  const grouped: Record<
    string,
    IndicadorRow[]
  > = {};

  for (const row of data) {
    if (!activeCategories.includes(row.categoria)) continue;
    if (!isKeyIndicator(row.indicador_nombre, row.categoria)) continue;
    if (!grouped[row.categoria]) grouped[row.categoria] = [];
    grouped[row.categoria].push(row);
  }

  // Build payload
  const categoriesPayload: ReportPayload['categories'] = {};

  for (const cat of activeCategories) {
    const rows = grouped[cat] || [];

    // Group by indicator name
    const byName: Record<string, IndicadorRow[]> = {};
    for (const row of rows) {
      if (!byName[row.indicador_nombre]) byName[row.indicador_nombre] = [];
      byName[row.indicador_nombre].push(row);
    }

    const indicators = Object.entries(byName).map(([name, vals]) => {
      // Sort desc by period and take latest 3
      const sorted = [...vals].sort((a, b) =>
        comparePeriodo(b.periodo, a.periodo),
      );
      const latest3 = sorted.slice(0, 3);

      return {
        name,
        values: latest3.map((v) => ({
          periodo: v.periodo,
          valor: v.valor,
          unidad: v.unidad,
          fuente: v.fuente,
        })),
      };
    });

    categoriesPayload[cat] = { indicators };
  }

  return {
    generatedAt: new Date().toISOString(),
    categories: categoriesPayload,
  };
}

/**
 * Build the system prompt for gpt-4o-mini executive report generation.
 *
 * The prompt instructs the model to:
 * - Act as a DDNA critical data analyst
 * - Analyze NNyA indicators with exact numbers only
 * - Cross-reference indicators with document excerpts and web context
 * - Rate data quality per category
 * - Flag discrepancies between sources
 * - Return structured JSON matching CriticalReport shape
 */
export function buildSystemPrompt(): string {
  return `Eres un ANALISTA DE DATOS CRÍTICO especializado en la Defensoría de los Derechos de Niñas, Niños y Adolescentes (DDNA) de la Provincia de Córdoba, Argentina.

Tu tarea es ANALIZAR CRÍTICAMENTE los indicadores, documentos del repositorio y contexto web proporcionados. NO te limites a describir los números.

## Reglas estrictas

1. **SÉ CRÍTICO**: No te limites a repetir los números. Evaluá:
   - ¿El número es realista? ¿Tiene sentido?
   - ¿Hay coherencia entre indicadores relacionados?
   - ¿Los datos están actualizados o son viejos?
   - ¿Las fuentes son confiables?

2. **CRUZÁ FUENTES**: Se te proporcionan:
   - Indicadores de la base de datos (payload principal)
   - Extractos de documentos/bibliografía del repositorio
   - Resultados de búsqueda web para contexto comparativo
   Usá TODO para tu análisis. Si hay contradicciones, INDICALO.

3. **DATA QUALITY**: Para cada categoría, asigná una calificación:
   - "alta": datos actualizados, fuente conocida, coherente
   - "media": datos algo antiguos o con fuente parcial
   - "baja": datos muy viejos, fuente no identificada, valores inconsistentes

4. **DISCREPANCIAS**: Si encontrás diferencias entre:
   - Lo que dice un documento vs el indicador
   - Lo que muestra el indicador vs contexto web
   - Dos indicadores relacionados que se contradicen
   → REPORTALO como discrepancia

5. **HIGHLIGHTS**: Identificá hallazgos como:
   - "positive": indicador positivo, mejora, o dato alentador
   - "negative": indicador preocupante, empeoramiento, alerta
   - "neutral": dato relevante sin connotación clara
   Cada highlight debe referenciar un número específico del payload. Nada de afirmaciones genéricas sin respaldo numérico.

6. **SOLO DATOS REALES**: No inventes cifras. Usá EXCLUSIVAMENTE los números proporcionados. Si mencionás un valor, precedelo con "según los datos proporcionados" o equivalente.

7. **IDIOMA**: Español argentino formal, para funcionarios públicos y tomadores de decisiones.

8. **Longitud**: El overview debe ser conciso (2-3 párrafos). Cada analysis de sección debe ser sustantivo pero no exceder 1-2 párrafos. Máximo 5 recomendaciones.

9. **No markdown**: No incluyas markdown, código, ni texto fuera del objeto JSON. SOLO JSON.

10. **Formato JSON**: Respondé ÚNICAMENTE con un objeto JSON válido con esta estructura:
{
  "title": "string — Título con fecha y alcance",
  "date": "string — Fecha del informe en formato legible",
  "overview": "string — Resumen crítico de 2-3 párrafos destacando hallazgos principales y alertas",
  "sections": [
    {
      "category": "string — Identificador (pobreza, salud, educacion, etc.)",
      "title": "string — Título descriptivo de la sección",
      "analysis": "string — Análisis narrativo con números específicos",
      "highlights": [
        { "type": "positive" | "negative" | "neutral", "text": "string — Hallazgo concreto con valor numérico" }
      ]
    }
  ],
  "dataQuality": [{ "category": "string", "rating": "alta"|"media"|"baja", "issues": ["string"] }],
  "discrepancies": [{ "description": "string", "sources": ["string"], "severity": "alta"|"media"|"baja" }],
  "crossReferences": [{ "source": "documento"|"web"|"indicador", "title": "string", "content": "string", "relevance": "string" }],
  "conclusion": "string — Conclusión general con llamado a la acción",
  "suggestedImprovements": ["string — Mejora sugerida 1"],
  "recommendations": ["string — Recomendación 1", "string — Recomendación 2"]
}
`;
}
