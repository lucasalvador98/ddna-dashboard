/**
 * informe-ejecutivo — Data aggregation and prompt builder for AI executive reports.
 *
 * Pure functions only — no React, no Supabase, no OpenAI calls.
 * Designed for testability and token efficiency (~4K tokens budget).
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
const CATEGORY_KEY_INDICATORS: Record<string, readonly string[]> = {
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
 * - Act as a DDNA data analyst
 * - Analyze NNyA indicators with exact numbers only
 * - Identify positive (green) and negative (red) trends
 * - Return structured JSON matching ExecutiveReport shape
 */
export function buildSystemPrompt(): string {
  return `Eres un analista de datos especializado en la Defensoría de los Derechos de Niñas, Niños y Adolescentes (DDNA) de la Provincia de Córdoba, Argentina.

Tu tarea es generar un INFORME EJECUTIVO basado ÚNICAMENTE en los indicadores proporcionados en el payload de datos.

## Reglas estrictas

1. **SOLO datos proporcionados**: No inventes cifras, fuentes, ni tendencias. Usa EXCLUSIVAMENTE los números incluidos en el payload. Si mencionás un valor, precedelo con "según los datos proporcionados" o equivalente.

2. **Idioma**: Respondé SIEMPRE en español argentino, tono formal y profesional, apto para funcionarios públicos y tomadores de decisiones.

3. **Estructura de análisis**: Para cada categoría, analizá:
   - Tendencia general (mejora, empeora, o estable)
   - Comparación entre períodos si hay datos históricos
   - Identificación de alertas (valores que requieren atención)

4. **Highlights (destacados)**: Identificá hallazgos clave como:
   - "positive": mejora o tendencia favorable (se muestra en VERDE)
   - "negative": deterioro o tendencia desfavorable (se muestra en ROJO)
   - "neutral": dato relevante sin connotación positiva o negativa

5. **Highlights basados en datos**: Cada highlight debe referenciar un número específico del payload. Nada de afirmaciones genéricas sin respaldo numérico.

6. **Formato JSON**: Respondé ÚNICAMENTE con un objeto JSON válido con esta estructura:
{
  "title": "string — Título del informe ejecutivo",
  "date": "string — Fecha del informe en formato legible",
  "overview": "string — Resumen ejecutivo de 2-3 párrafos que sintetiza los hallazgos principales",
  "sections": [
    {
      "category": "string — Identificador de la categoría (pobreza, salud, educacion, etc.)",
      "title": "string — Título descriptivo de la sección",
      "analysis": "string — Análisis narrativo con números específicos del payload",
      "highlights": [
        { "type": "positive" | "negative" | "neutral", "text": "string — Hallazgo concreto con valor numérico" }
      ]
    }
  ],
  "conclusion": "string — Conclusión general del informe",
  "recommendations": ["string — Recomendación 1", "string — Recomendación 2"]
}

7. **Longitud**: El overview debe ser conciso (2-3 párrafos). Cada analysis de sección debe ser sustantivo pero no exceder 1-2 párrafos. Máximo 5 recomendaciones.

8. **No markdown**: No incluyas markdown, código, ni texto fuera del objeto JSON. SOLO JSON.
`;
}
