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
          region: string;
          desglose: Record<string, unknown>;
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

/**
 * A single KPI card to display prominently at the top of the report.
 * trend: "up" | "down" | "stable" relative to the previous period.
 * alert: true when the value crosses a critical threshold.
 */
export interface ReportKPI {
  label: string;
  value: string;
  unit: string;
  period: string;
  source: string;
  trend: 'up' | 'down' | 'stable';
  trendNote: string;
  alert: boolean;
  axis: string;
}

/** Extended report with critical analysis fields. */
export interface CriticalReport extends ExecutiveReport {
  kpis: ReportKPI[];
  dataQuality: DataQuality[];
  discrepancies: Discrepancy[];
  crossReferences: CrossReference[];
  suggestedImprovements: string[];
}

// ─── Thematic axes → DB categories mapping ─────────────────────

/**
 * High-level thematic axes shown to the user in the report modal.
 * Each axis maps to one or more DB `categoria` values.
 */
export const THEMATIC_AXES = [
  {
    id: 'educacion',
    label: 'Educación',
    dbCategories: ['educacion', 'aprender', 'anuario_educacion'],
  },
  {
    id: 'salud',
    label: 'Salud',
    dbCategories: ['salud', 'salud_adolescente', 'deis'],
  },
  {
    id: 'pobreza',
    label: 'Pobreza',
    dbCategories: ['pobreza', 'consumo'],
  },
  {
    id: 'inversion',
    label: 'Inversión Social',
    dbCategories: ['inversion'],
  },
  {
    id: 'seguridad_justicia',
    label: 'Seguridad y Justicia',
    dbCategories: ['seguridad', 'justicia'],
  },
  {
    id: 'demografia',
    label: 'Demografía',
    dbCategories: ['demografia'],
  },
] as const;

export type ThematicAxisId = (typeof THEMATIC_AXES)[number]['id'];

/** Expand thematic axis IDs to the corresponding DB category names. */
export function expandAxesToCategories(axisIds: string[]): string[] {
  if (axisIds.length === 0) return [...ALL_CATEGORIES];
  const result: string[] = [];
  for (const axis of THEMATIC_AXES) {
    if (axisIds.includes(axis.id)) {
      result.push(...axis.dbCategories);
    }
  }
  return result;
}

// ─── Key indicators per category ───────────────────────────────

/** Known DB categories in the DDNA dashboard. */
export const ALL_CATEGORIES = [
  'salud',
  'educacion',
  'pobreza',
  'seguridad',
  'inversion',
  'demografia',
  'anuario_educacion',
  'aprender',
  'consumo',
  'deis',
  'justicia',
  'salud_adolescente',
] as const;

export type Category = (typeof ALL_CATEGORIES)[number];

/**
 * Map of category → list of canonical indicator names.
 * Categories not listed or with empty arrays include ALL their indicators.
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
    'NNyA en nivel muy bajo - inseguridad alimentaria severa',
    'NNyA sin internet en el hogar',
    'Empleo no registrado (informal)',
    'Empleo pleno de derechos (18+)',
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
    'Escolarización por edad',
  ],
  seguridad: [
    INDICATOR_NAMES.CASOS_VIOLENCIA_FAMILIAR,
    INDICATOR_NAMES.TOTAL_CASOS_JUSTICIA,
    'Tasa de homicidio doloso',
  ],
  aprender: [
    'Nivel Lengua - Por debajo del básico',
    'Nivel Lengua - Satisfactorio',
    'Nivel Lengua - Avanzado',
    'Nivel Lengua - Básico',
  ],
  deis: [
    'Nacidos vivos registrados',
  ],
  salud_adolescente: [
    'Embarazo adolescente (10-19 años)',
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

/** Mirror of the SQL eje_de_categoria() function used in v_informe_contexto. */
function eje_de_categoria_ts(cat: string): string {
  const map: Record<string, string> = {
    educacion: 'educacion',
    aprender: 'educacion',
    anuario_educacion: 'educacion',
    salud: 'salud',
    salud_adolescente: 'salud',
    deis: 'salud',
    pobreza: 'pobreza',
    consumo: 'pobreza',
    inversion: 'inversion',
    seguridad: 'seguridad_justicia',
    justicia: 'seguridad_justicia',
    demografia: 'demografia',
  };
  return map[cat] ?? 'otro';
}

/**
 * Search v_informe_contexto for document chunks relevant to a thematic axis.
 * Uses the view's eje_tematico + ejes_relacionados columns so transversal
 * indicators are included automatically. Only returns chunk_util=true rows
 * (excludes raw Excel data files that pollute RAG).
 */
export async function searchDocuments(
  supabaseClient: unknown,
  axis: string,
  maxResults: number = 3,
): Promise<{ title: string; content: string }[]> {
  // axis is already a thematic axis id (educacion, salud, pobreza, etc.)
  // caller (route.ts) deduplicates before calling, so no mapping needed here
  const eje = eje_de_categoria_ts(axis);

  const db = supabaseClient as {
    from(table: string): {
      select(cols: string): {
        eq(col: string, val: unknown): {
          eq(col: string, val: unknown): {
            limit(n: number): Promise<{ data: unknown[] | null; error: unknown }>;
          };
          limit(n: number): Promise<{ data: unknown[] | null; error: unknown }>;
        };
      };
    };
  };

  const { data, error } = await db
    .from('v_informe_contexto')
    .select('titulo, contenido')
    .eq('tipo', 'documento')
    .eq('eje_tematico', eje)
    .limit(maxResults);

  if (error) {
    console.warn(`searchDocuments error for eje "${eje}":`, error);
    return [];
  }

  const results: { title: string; content: string }[] = [];
  if (data) {
    for (const raw of data) {
      const row = (raw ?? {}) as Record<string, unknown>;
      results.push({
        title: String(row.titulo ?? 'Documento'),
        content: String(row.contenido ?? '').substring(0, 500),
      });
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
      ? categories.filter((c) => (ALL_CATEGORIES as readonly string[]).includes(c))
      : [...ALL_CATEGORIES];

  // Group by category
  const grouped: Record<string, IndicadorRow[]> = {};

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
      // Sort desc by period using our robust helper and take latest 3
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
          region: v.region,
          desglose: v.desglose ?? {},
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
 * - Apply specific domain rules (INDEC zero values, TMI/RMM thresholds, socio-educational quintiles)
 * - Cross-reference indicators with document excerpts and web context
 * - Rate data quality per category
 * - Flag discrepancies between sources
 * - Return structured JSON matching CriticalReport shape
 */
export function buildSystemPrompt(): string {
  return `Eres un ANALISTA DE DATOS CRÍTICO especializado en la Defensoría de los Derechos de Niñas, Niños y Adolescentes (DDNA) de la Provincia de Córdoba, Argentina.

Tu tarea es ANALIZAR CRÍTICAMENTE los indicadores de la base de datos (payload principal), documentos del repositorio y contexto web proporcionados. NO te limites a describir los números.

## Reglas de Negocio y Reglas de Dominio (CRÍTICO)

1. **Interpretación de Valores Cero (0) en Pobreza (2013-2015)**:
   - Si detectás un valor de Pobreza o Indigencia igual a 0 entre los años 2013 y 2015 (período de intervención del INDEC), interpretalo como "Dato no disponible por discontinuidad estadística / intervención institucional". NO digas que la pobreza o indigencia bajó a cero en Córdoba.

2. **Umbrales Críticos de Alerta (Salud)**:
   - **Tasa de Mortalidad Infantil (TMI)**: Cualquier valor superior a 10‰ es considerado críticamente alarmante en el contexto provincial.
   - **Razón de Mortalidad Materna (RMM)**: Tasas elevadas deben reportarse inmediatamente como prioridades de política de salud pública.

3. **Interpretación de "Region" en Evaluaciones Aprender**:
   - En la categoría "aprender", los valores de "region" (por ejemplo: "Q1-Estatal", "Q5-Privado") NO representan regiones geográficas tradicionales, sino la intersección entre el Quintil de Ingreso del Hogar (Q1 = más bajo, Q5 = más alto) y el Sector de la Escuela (Estatal / Privado). Analizalo bajo la perspectiva de brechas de desigualdad socioeducativa.

4. **Análisis de "Desglose"**:
   - Prestá especial atención a los desgloses poblacionales en el JSON (ej. "NNyA 0-17", "18+", quintiles, etc.). Cuando existan desgloses por grupos vulnerables, resaltá las brechas.

## Reglas metodológicas generales

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
   - Two indicadores relacionados que se contradicen
   → REPORTALO como discrepancia

5. **HIGHLIGHTS**: Identificá hallazgos como:
   - "positive": indicador positivo, mejora, o dato alentador
   - "negative": indicador preocupante, empeoramiento, alerta
   - "neutral": dato relevante sin connotación clara
   Cada highlight debe referenciar un número específico del payload. Nada de afirmaciones genéricas sin respaldo numérico.

6. **SOLO DATOS REALES**: No inventes cifras. Usá EXCLUSIVAMENTE los números proporcionados. Si mencionás un valor, precedelo con "según los datos proporcionados" o equivalente.

7. **IDIOMA**: Español argentino formal, para funcionarios públicos y tomadores de decisiones.

8. **Extensión y profundidad del análisis**:
   - El "overview" debe tener mínimo 4 párrafos: contexto general, hallazgo más alarmante, hallazgo más positivo, y síntesis de brechas entre ejes.
   - Cada "analysis" de sección debe tener mínimo 4-5 párrafos densos. Estructura sugerida: (1) contexto histórico del indicador en la provincia, (2) análisis del valor actual con comparación temporal, (3) análisis de brechas territoriales o poblacionales (quintiles, departamentos, género si aplica), (4) relación con otros ejes temáticos (impacto cruzado), (5) evaluación crítica de la calidad y completitud del dato.
   - El "conclusion" debe tener mínimo 3 párrafos con un llamado a la acción concreto.
   - Máximo 8 recomendaciones, redactadas como acciones específicas con actor responsable (ej: "El Ministerio de Educación debe...").
   - NO resumas ni acortes. Más texto es mejor. El informe es para funcionarios que necesitan fundamentación.

9. **No markdown**: No incluyas markdown, código, ni texto fuera del objeto JSON. SOLO JSON.

10. **KPIs**: Seleccioná entre 6 y 10 indicadores clave del payload para mostrar como cards destacadas. Criterios:
   - Elegí los más críticos o llamativos (alertas, valores extremos, brechas grandes)
   - Incluí al menos un KPI por cada eje temático presente en los datos
   - "source" es la fuente del dato tal como aparece en el payload (ej: "EPH-INDEC", "DEIS", "UCA-ODSA", "Aprender 2024")
   - "trend" compará con el período anterior disponible: "up" si subió, "down" si bajó, "stable" si no cambió
   - "trendNote" es una frase corta como "vs 36% en S1 2024" o "sin cambio desde 2022"
   - "alert" es true cuando el valor supera un umbral crítico (TMI > 10‰, pobreza > 40%, inseguridad alimentaria > 30%, etc.)
   - "axis" es el eje temático (pobreza, salud, educacion, seguridad_justicia, inversion, demografia)

11. **Formato JSON**: Respondé ÚNICAMENTE con un objeto JSON válido con esta estructura:
{
  "title": "string — Título con fecha y alcance",
  "date": "string — Fecha del informe en formato legible",
  "overview": "string — Resumen crítico de mínimo 4 párrafos",
  "kpis": [
    {
      "label": "string — Nombre corto del indicador (ej: 'Pobreza en hogares')",
      "value": "string — Valor numérico como string (ej: '21.0')",
      "unit": "string — Unidad (ej: '%', '‰', 'casos')",
      "period": "string — Período del dato (ej: '2025', 'S2 2024')",
      "source": "string — Fuente del dato (ej: 'EPH-INDEC', 'DEIS', 'UCA-ODSA')",
      "trend": "up" | "down" | "stable",
      "trendNote": "string — Comparación breve con período anterior",
      "alert": true | false,
      "axis": "string — eje temático"
    }
  ],
  "sections": [
    {
      "category": "string — Identificador (pobreza, salud, educacion, aprender, etc.)",
      "title": "string — Título descriptivo de la sección",
      "analysis": "string — Análisis narrativo extenso con mínimo 4-5 párrafos y números específicos",
      "highlights": [
        { "type": "positive" | "negative" | "neutral", "text": "string — Hallazgo concreto con valor numérico y fuente" }
      ]
    }
  ],
  "dataQuality": [{ "category": "string", "rating": "alta"|"media"|"baja", "issues": ["string"] }],
  "discrepancies": [{ "description": "string", "sources": ["string"], "severity": "alta"|"media"|"baja" }],
  "crossReferences": [{ "source": "documento"|"web"|"indicador", "title": "string", "content": "string", "relevance": "string" }],
  "conclusion": "string — Conclusión de mínimo 3 párrafos con llamado a la acción específico",
  "suggestedImprovements": ["string — Mejora sugerida con actor responsable"],
  "recommendations": ["string — Recomendación específica con actor responsable"]
}
`;
}
