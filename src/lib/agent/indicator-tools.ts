import { createClient } from '@supabase/supabase-js';
import { parseDesglose } from '@/lib/parse-desglose';

// ---------------------------------------------------------------------------
// Supabase client (anon key — public read only)
// ---------------------------------------------------------------------------

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseAnonKey);
}

// ---------------------------------------------------------------------------
// Raw DB row shape
// ---------------------------------------------------------------------------

interface IndicadorRow {
  id: string;
  indicador_nombre: string;
  categoria: string;
  valor: number;
  unidad: string;
  periodo: string;
  region: string;
  desglose: unknown;
  fuente: string;
  ultima_actualizacion: string;
  activo: boolean;
}

// ---------------------------------------------------------------------------
// Public result types
// ---------------------------------------------------------------------------

/** One indicator summary inside a category. */
export interface IndicadorInfo {
  nombre: string;
  unidad: string;
  periodos: string[];
  total_filas: number;
}

/** A category with its indicators. */
export interface CategoriaInfo {
  nombre: string;
  indicadores: IndicadorInfo[];
}

/** Return type for listAvailableIndicators(). */
export interface ListAvailableResult {
  categorias: CategoriaInfo[];
  total_categorias: number;
  total_indicadores: number;
}

/** A single data point with desglose. */
export interface IndicatorValue {
  periodo: string;
  valor: number;
  unidad: string;
  desglose: Record<string, unknown>;
}

/** Return type for getLatestIndicatorValue(). */
export interface LatestValueResult {
  indicador: string;
  valores: IndicatorValue[];
  total_filas: number;
}

/** A time-series data point. */
export interface TimeSeriesPoint {
  periodo: string;
  valor: number;
}

/** Return type for getIndicatorTimeSeries(). */
export interface TimeSeriesResult {
  indicador: string;
  serie: TimeSeriesPoint[];
  cambio_porcentual: number | null;
}

/** One indicator inside a category overview. */
export interface CategoryIndicator {
  nombre: string;
  ultimo_valor: number;
  unidad: string;
  ultimo_periodo: string;
}

/** Return type for getCategoryOverview(). */
export interface CategoryOverviewResult {
  categoria: string;
  indicadores: CategoryIndicator[];
}

/** One breakdown group. */
export interface BreakdownItem {
  grupo: string;
  valor: number;
  periodo: string;
}

/** Return type for getIndicatorBreakdown(). */
export interface BreakdownResult {
  indicador: string;
  desgloses: BreakdownItem[];
  total: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_RESULTS = 200;
const DEFAULT_LATEST_LIMIT = 5;
const DEFAULT_SERIES_LIMIT = 50;

// ---------------------------------------------------------------------------
// Tool functions
// ---------------------------------------------------------------------------

/**
 * Lists all available indicators grouped by category.
 *
 * Queries all active rows from `indicadores`, then groups by category and
 * indicator name in-memory. Capped at MAX_RESULTS rows.
 */
export async function listAvailableIndicators(): Promise<ListAvailableResult> {
  const client = getSupabaseClient();

  // First get all distinct indicator names per category (without periodos)
  // to avoid truncation from the raw-row LIMIT.
  const { data: distinctData, error: distinctError } = await client
    .from('indicadores')
    .select('categoria, indicador_nombre, unidad')
    .eq('activo', true)
    .order('categoria', { ascending: true })
    .order('indicador_nombre', { ascending: true });

  if (distinctError) {
    console.error('listAvailableIndicators distinct query error:', distinctError);
    throw new Error('Error al consultar indicadores disponibles.');
  }

  if (!distinctData || distinctData.length === 0) {
    return { categorias: [], total_categorias: 0, total_indicadores: 0 };
  }

  // Deduplicate (categoria, indicador_nombre, unidad) in case of repeats
  const deduped = new Map<string, (typeof distinctData)[0]>();
  for (const row of distinctData) {
    const key = `${row.categoria}||${row.indicador_nombre}`;
    if (!deduped.has(key)) {
      deduped.set(key, row);
    }
  }

  // Now get periodos for each indicator (separate query with limit)
  const distinctEntries = Array.from(deduped.values());
  const indicatorNames = [...new Set(distinctEntries.map(r => r.indicador_nombre))];

  const { data: periodData, error: periodError } = await client
    .from('indicadores')
    .select('indicador_nombre, periodo')
    .eq('activo', true)
    .in('indicador_nombre', indicatorNames)
    .order('periodo', { ascending: false })
    .limit(MAX_RESULTS * 5);

  if (periodError) {
    console.error('listAvailableIndicators period query error:', periodError);
    throw new Error('Error al consultar periodos de indicadores.');
  }

  // Build a map: indicador_nombre → Set of periodos
  const periodMap = new Map<string, Set<string>>();
  if (periodData) {
    for (const row of periodData as Pick<IndicadorRow, 'indicador_nombre' | 'periodo'>[]) {
      if (!periodMap.has(row.indicador_nombre)) {
        periodMap.set(row.indicador_nombre, new Set());
      }
      periodMap.get(row.indicador_nombre)!.add(String(row.periodo));
    }
  }

  const catMap = new Map<
    string,
    Map<string, { unidad: string; periodos: string[]; total_filas: number }>
  >();

  for (const row of distinctEntries) {
    if (!catMap.has(row.categoria)) {
      catMap.set(row.categoria, new Map());
    }
    const indMap = catMap.get(row.categoria)!;

    if (!indMap.has(row.indicador_nombre)) {
      const periodos = Array.from(periodMap.get(row.indicador_nombre) ?? []).sort().reverse();
      indMap.set(row.indicador_nombre, {
        unidad: row.unidad,
        periodos,
        total_filas: periodos.length,
      });
    }
  }

  // Build result from deduplicated entries
  const categorias: CategoriaInfo[] = [];
  let totalIndicadores = 0;

  for (const [catName, indMap] of catMap.entries()) {
    const indicadores: IndicadorInfo[] = [];
    for (const [indName, entry] of indMap.entries()) {
      indicadores.push({
        nombre: indName,
        unidad: entry.unidad,
        periodos: entry.periodos,
        total_filas: entry.total_filas,
      });
      totalIndicadores += 1;
    }
    categorias.push({ nombre: catName, indicadores });
  }

  return { categorias, total_categorias: categorias.length, total_indicadores: totalIndicadores };
}

/**
 * Gets the latest value(s) for a specific indicator.
 *
 * Returns up to `DEFAULT_LATEST_LIMIT` rows ordered by `periodo` DESC.
 */
export async function getLatestIndicatorValue(
  indicadorNombre: string,
  categoria?: string
): Promise<LatestValueResult> {
  const client = getSupabaseClient();

  let query = client
    .from('indicadores')
    .select('*')
    .eq('activo', true)
    .eq('indicador_nombre', indicadorNombre)
    .order('periodo', { ascending: false })
    .limit(DEFAULT_LATEST_LIMIT);

  if (categoria) {
    query = query.eq('categoria', categoria);
  }

  const { data, error } = await query;

  if (error) {
    console.error('getLatestIndicatorValue DB error:', error);
    throw new Error(`Error al consultar valores para "${indicadorNombre}".`);
  }

  if (!data || data.length === 0) {
    // Count total matching rows (without LIMIT) to give a hint even when the
    // LIMITed query returns nothing (should not happen if rows exist, but
    // defensive).
    const { count } = await client
      .from('indicadores')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true)
      .eq('indicador_nombre', indicadorNombre);

    return {
      indicador: indicadorNombre,
      valores: [],
      total_filas: count ?? 0,
    };
  }

  const rows = data as IndicadorRow[];

  const valores: IndicatorValue[] = rows.map(row => ({
    periodo: row.periodo,
    valor: row.valor,
    unidad: row.unidad,
    desglose: parseDesglose(row.desglose),
  }));

  // Also get the total count (unfiltered by LIMIT)
  const { count } = await client
    .from('indicadores')
    .select('*', { count: 'exact', head: true })
    .eq('activo', true)
    .eq('indicador_nombre', indicadorNombre);

  return {
    indicador: indicadorNombre,
    valores,
    total_filas: count ?? rows.length,
  };
}

/**
 * Gets time-series data for trend analysis.
 *
 * Returns all periods sorted ASC with the first-to-last percentage change.
 */
export async function getIndicatorTimeSeries(
  indicadorNombre: string,
  categoria?: string,
  limit?: number
): Promise<TimeSeriesResult> {
  const client = getSupabaseClient();
  const effectiveLimit = limit && limit > 0 && limit <= MAX_RESULTS ? limit : DEFAULT_SERIES_LIMIT;

  let query = client
    .from('indicadores')
    .select('periodo, valor')
    .eq('activo', true)
    .eq('indicador_nombre', indicadorNombre)
    .order('periodo', { ascending: true })
    .limit(effectiveLimit);

  if (categoria) {
    query = query.eq('categoria', categoria);
  }

  const { data, error } = await query;

  if (error) {
    console.error('getIndicatorTimeSeries DB error:', error);
    throw new Error(`Error al consultar serie temporal para "${indicadorNombre}".`);
  }

  if (!data || data.length === 0) {
    return { indicador: indicadorNombre, serie: [], cambio_porcentual: null };
  }

  const rows = data as Pick<IndicadorRow, 'periodo' | 'valor'>[];

  const serie: TimeSeriesPoint[] = rows.map(row => ({
    periodo: row.periodo,
    valor: row.valor,
  }));

  // Percentage change from first to last data point
  let cambio_porcentual: number | null = null;
  if (serie.length >= 2) {
    const first = serie[0].valor;
    const last = serie[serie.length - 1].valor;
    if (first !== 0) {
      cambio_porcentual = Number((((last - first) / Math.abs(first)) * 100).toFixed(2));
    }
  }

  return { indicador: indicadorNombre, serie, cambio_porcentual };
}

/**
 * Gets all indicators in a category with their latest values.
 */
export async function getCategoryOverview(categoria: string): Promise<CategoryOverviewResult> {
  const client = getSupabaseClient();

  // Get all active rows for the category, ordered by periodo DESC so the
  // first row per indicator is the latest.
  const { data, error } = await client
    .from('indicadores')
    .select('indicador_nombre, valor, unidad, periodo')
    .eq('activo', true)
    .eq('categoria', categoria)
    .order('periodo', { ascending: false })
    .limit(MAX_RESULTS);

  if (error) {
    console.error('getCategoryOverview DB error:', error);
    throw new Error(`Error al consultar la categoría "${categoria}".`);
  }

  if (!data || data.length === 0) {
    return { categoria, indicadores: [] };
  }

  // Group by indicador_nombre, keeping only the first (latest) periodo per indicator
  const seen = new Set<string>();
  const indicadores: CategoryIndicator[] = [];

  for (const row of data as Pick<
    IndicadorRow,
    'indicador_nombre' | 'valor' | 'unidad' | 'periodo'
  >[]) {
    if (seen.has(row.indicador_nombre)) continue;
    seen.add(row.indicador_nombre);
    indicadores.push({
      nombre: row.indicador_nombre,
      ultimo_valor: row.valor,
      unidad: row.unidad,
      ultimo_periodo: row.periodo,
    });
  }

  return { categoria, indicadores };
}

// ---------------------------------------------------------------------------
// Breakdown helpers
// ---------------------------------------------------------------------------

/**
 * Fields to try when auto-detecting a desglose breakdown field.
 * Ordered by priority (most common grouping fields first).
 */
const AUTO_DETECT_FIELDS = [
  'grupo_edad',
  'categoria',
  'nivel',
  'tipo',
  'ambito',
  'sector',
  'genero',
  'region',
];

/**
 * Finds the desglose field that has the most distinct non-null values across
 * all rows. Returns null if no suitable field is found.
 */
function detectBreakdownField(parsedDesgloses: Record<string, unknown>[]): string | null {
  let bestField: string | null = null;
  let bestCount = 0;

  for (const field of AUTO_DETECT_FIELDS) {
    const distinctValues = new Set<string>();
    for (const d of parsedDesgloses) {
      const val = d[field];
      if (val !== undefined && val !== null) {
        distinctValues.add(String(val));
      }
    }
    if (distinctValues.size > bestCount) {
      bestCount = distinctValues.size;
      bestField = field;
    }
  }

  // If none of the predefined fields exist, pick the first field that appears
  // in at least 2 rows
  if (bestField === null && parsedDesgloses.length > 0) {
    const firstKeys = Object.keys(parsedDesgloses[0]);
    for (const key of firstKeys) {
      const distinctValues = new Set<string>();
      for (const d of parsedDesgloses) {
        const val = d[key];
        if (val !== undefined && val !== null) {
          distinctValues.add(String(val));
        }
      }
      if (distinctValues.size > 1) {
        bestField = key;
        break;
      }
    }
  }

  return bestField;
}

/**
 * Compares an indicator across different desglose values.
 *
 * If `desgloseField` is not provided, the function auto-detects the most
 * suitable grouping field by inspecting the parsed desglose objects.
 */
export async function getIndicatorBreakdown(
  indicadorNombre: string,
  categoria?: string,
  desgloseField?: string
): Promise<BreakdownResult> {
  const client = getSupabaseClient();

  // Step 1: Determine the latest periodo for this indicator
  const { data: latestRows, error: latestErr } = await client
    .from('indicadores')
    .select('periodo')
    .eq('activo', true)
    .eq('indicador_nombre', indicadorNombre)
    .order('periodo', { ascending: false })
    .limit(1);

  if (latestErr || !latestRows || latestRows.length === 0) {
    console.error('getIndicatorBreakdown – no period found:', latestErr);
    return { indicador: indicadorNombre, desgloses: [], total: 0 };
  }

  const latestPeriodo = (latestRows[0] as Pick<IndicadorRow, 'periodo'>).periodo;

  // Step 2: Get all rows for the latest periodo
  let query = client
    .from('indicadores')
    .select('*')
    .eq('activo', true)
    .eq('indicador_nombre', indicadorNombre)
    .eq('periodo', latestPeriodo)
    .limit(MAX_RESULTS);

  if (categoria) {
    query = query.eq('categoria', categoria);
  }

  const { data, error } = await query;

  if (error) {
    console.error('getIndicatorBreakdown DB error:', error);
    throw new Error(`Error al consultar desglose para "${indicadorNombre}".`);
  }

  if (!data || data.length === 0) {
    return { indicador: indicadorNombre, desgloses: [], total: 0 };
  }

  const rows = data as IndicadorRow[];

  // Step 3: Parse all desgloses
  const parsedDesgloses = rows.map(row => parseDesglose(row.desglose));

  // Step 4: Determine the grouping field
  const effectiveField = desgloseField || detectBreakdownField(parsedDesgloses);

  if (!effectiveField) {
    // No desglose field to group by — return flat list
    const desgloses: BreakdownItem[] = rows.map((row, i) => ({
      grupo: `Fila ${i + 1}`,
      valor: row.valor,
      periodo: row.periodo,
    }));
    const total = desgloses.reduce((sum, d) => sum + d.valor, 0);
    return { indicador: indicadorNombre, desgloses, total };
  }

  // Step 5: Group by the selected field (sum values within each group)
  const groupMap = new Map<string, { valor: number; periodo: string }>();

  let total = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const d = parsedDesgloses[i];
    const groupValue = d[effectiveField];

    if (groupValue === undefined || groupValue === null) {
      // Rows without this field get their own "Sin clasificar" group
      const key = 'Sin clasificar';
      if (!groupMap.has(key)) {
        groupMap.set(key, { valor: 0, periodo: row.periodo });
      }
      groupMap.get(key)!.valor += row.valor;
      total += row.valor;
      continue;
    }

    const key = String(groupValue);
    if (!groupMap.has(key)) {
      groupMap.set(key, { valor: 0, periodo: row.periodo });
    }
    groupMap.get(key)!.valor += row.valor;
    total += row.valor;
  }

  const desgloses: BreakdownItem[] = Array.from(groupMap.entries()).map(([grupo, item]) => ({
    grupo,
    valor: Number(item.valor.toFixed(4)),
    periodo: item.periodo,
  }));

  return { indicador: indicadorNombre, desgloses, total };
}

// ---------------------------------------------------------------------------
// Search / fuzzy-match
// ---------------------------------------------------------------------------

export interface SearchResult {
  indicador_nombre: string;
  categoria: string;
  ultimo_valor: number | null;
  unidad: string;
  ultimo_periodo: string | null;
  fuente: string | null;
  total_resultados: number;
}

/**
 * Busca indicadores por nombre usando ILIKE (fuzzy match).
 * Útil cuando el usuario pregunta con términos aproximados
 * (ej: "pobreza infantil", "mortalidad", "desempleo jóvenes").
 *
 * Retorna hasta 20 resultados con el último valor disponible de cada uno.
 */
export async function searchIndicators(
  query: string,
  categoria?: string
): Promise<SearchResult[]> {
  const client = getSupabaseClient();

  let dbQuery = client
    .from('indicadores')
    .select('indicador_nombre, categoria, valor, unidad, periodo, fuente')
    .eq('activo', true)
    .ilike('indicador_nombre', `%${query}%`)
    .order('periodo', { ascending: false })
    .limit(200);

  if (categoria) {
    dbQuery = dbQuery.eq('categoria', categoria);
  }

  const { data, error } = await dbQuery;

  if (error) {
    console.error('searchIndicators DB error:', error);
    throw new Error(`Error al buscar indicadores para "${query}".`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  const rows = data as Pick<IndicadorRow, 'indicador_nombre' | 'categoria' | 'valor' | 'unidad' | 'periodo' | 'fuente'>[];

  // Keep only the latest row per indicator name
  const seen = new Map<string, (typeof rows)[0]>();
  for (const row of rows) {
    if (!seen.has(row.indicador_nombre)) {
      seen.set(row.indicador_nombre, row);
    }
  }

  const results = Array.from(seen.entries()).map(([_, row]) => ({
    indicador_nombre: row.indicador_nombre,
    categoria: row.categoria,
    ultimo_valor: row.valor,
    unidad: row.unidad,
    ultimo_periodo: String(row.periodo),
    fuente: row.fuente,
    total_resultados: seen.size,
  }));

  return results;
}

// ---------------------------------------------------------------------------
// Tool definitions (for the LLM system prompt — legacy format)
// ---------------------------------------------------------------------------

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: string;
}

/** Tool definitions for the indicator tools (excludes search_knowledge_base). */
export const INDICATOR_TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'listAvailableIndicators',
    description:
      'Lista todos los indicadores disponibles agrupados por categoría (pobreza, salud, educacion, inversion, demografia, seguridad, etc.). Usala cuando el usuario pide ver qué datos hay disponibles o explora el catálogo de indicadores.',
    parameters: 'sin parámetros',
  },
  {
    name: 'getLatestIndicatorValue',
    description:
      'Obtiene los valores más recientes de un indicador específico. Usala para preguntas sobre el estado actual de un indicador (ej: "¿Cuál es la tasa de pobreza infantil actual?").',
    parameters: 'indicadorNombre (requerido), categoria (opcional)',
  },
  {
    name: 'getIndicatorTimeSeries',
    description:
      'Obtiene la serie temporal completa de un indicador para análisis de tendencias. Usala cuando el usuario pide evolución histórica, tendencias, o cambios a lo largo del tiempo (ej: "¿Cómo evolucionó la mortalidad infantil?").',
    parameters: 'indicadorNombre (requerido), categoria (opcional), limit (opcional, default 50)',
  },
  {
    name: 'getCategoryOverview',
    description:
      'Obtiene un resumen de todos los indicadores dentro de una categoría con sus últimos valores. Usala para tener una visión general de un tema o cuando el usuario pide "datos sobre educación" sin especificar un indicador concreto.',
    parameters: 'categoria (requerido)',
  },
  {
    name: 'getIndicatorBreakdown',
    description:
      'Desglosa un indicador por una dimensión específica (ej: grupo de edad, género, región). Usala cuando el usuario pregunta por diferencias entre grupos o quiere ver la composición de un indicador (ej: "Pobreza infantil por grupo de edad").',
    parameters:
      'indicadorNombre (requerido), categoria (opcional), desgloseField (opcional — se auto-detecta si no se especifica)',
  },
  {
    name: 'searchIndicators',
    description:
      'Busca indicadores por nombre usando coincidencia aproximada (ILIKE). Usala cuando el usuario pregunta con términos generales (ej: "pobreza infantil", "mortalidad", "desempleo", "educación") y no sabés el nombre exacto del indicador. Devuelve hasta 20 resultados con su último valor.',
    parameters: 'query (requerido) — término de búsqueda, categoria (opcional) para filtrar por categoría',
  },
];

// ---------------------------------------------------------------------------
// OpenAI-compatible tool definitions (for native function calling)
// ---------------------------------------------------------------------------

/**
 * OpenAI-compatible tool definitions for indicator tools.
 * Use these with Groq/OpenAI function calling API via the `tools` parameter.
 */
export const INDICATOR_OPENAPI_TOOLS: Array<{
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}> = [
  {
    type: 'function',
    function: {
      name: 'listAvailableIndicators',
      description:
        'Lista todos los indicadores disponibles agrupados por categoría (pobreza, salud, educacion, inversion, demografia, seguridad, etc). Usala cuando el usuario pregunte qué datos hay disponibles o quiera explorar el catálogo.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getLatestIndicatorValue',
      description:
        'Obtiene los valores más recientes de un indicador específico. Usala para preguntas sobre el estado actual (ej: "¿Cuál es la tasa de pobreza infantil actual?").',
      parameters: {
        type: 'object',
        properties: {
          indicadorNombre: {
            type: 'string',
            description:
              'Nombre exacto del indicador (ej: "Mortalidad infantil (TMI Cba)", "Pobreza infantil", "Tasa de asistencia educativa"). Usá listAvailableIndicators primero si no sabés el nombre exacto.',
          },
          categoria: {
            type: 'string',
            description:
              'Categoría del indicador (pobreza, salud, educacion, inversion, demografia, seguridad). Opcional pero ayuda a desambiguar.',
          },
        },
        required: ['indicadorNombre'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getIndicatorTimeSeries',
      description:
        'Obtiene la serie temporal completa de un indicador para análisis de tendencias. Usala cuando pregunten por evolución histórica, tendencias, o cambios a lo largo del tiempo.',
      parameters: {
        type: 'object',
        properties: {
          indicadorNombre: {
            type: 'string',
            description:
              'Nombre exacto del indicador (ej: "Mortalidad infantil (TMI Cba)"). Usá listAvailableIndicators primero si no sabés el nombre exacto.',
          },
          categoria: {
            type: 'string',
            description:
              'Categoría del indicador para desambiguar si hay nombres similares en distintas categorías.',
          },
          limit: {
            type: 'number',
            description:
              'Cantidad máxima de períodos a retornar (default: 50, máximo: 200).',
          },
        },
        required: ['indicadorNombre'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getCategoryOverview',
      description:
        'Obtiene un resumen de todos los indicadores dentro de una categoría con sus últimos valores. Usala para tener una visión general de un tema o cuando pregunten por "datos sobre educación" sin especificar un indicador concreto.',
      parameters: {
        type: 'object',
        properties: {
          categoria: {
            type: 'string',
            description:
              'Categoría a consultar. Valores válidos: pobreza, salud, educacion, inversion, demografia, seguridad, justicia, salud_adolescente, anuario_educacion, aprender, consumo, deis.',
          },
        },
        required: ['categoria'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getIndicatorBreakdown',
      description:
        'Desglosa un indicador por una dimensión específica (grupo de edad, género, región). Usala cuando pregunten por diferencias entre grupos o quieran ver la composición de un indicador.',
      parameters: {
        type: 'object',
        properties: {
          indicadorNombre: {
            type: 'string',
            description:
              'Nombre exacto del indicador a desglosar.',
          },
          categoria: {
            type: 'string',
            description:
              'Categoría del indicador para desambiguar.',
          },
          desgloseField: {
            type: 'string',
            description:
              'Campo de desglose (grupo_edad, genero, region). Opcional — se auto-detecta si no se especifica.',
          },
        },
        required: ['indicadorNombre'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'searchIndicators',
      description:
        'Busca indicadores por nombre usando coincidencia aproximada (ILIKE). Usala cuando el usuario pregunte con términos generales (ej: "pobreza infantil", "mortalidad", "desempleo", "educación") y no sabés el nombre exacto del indicador. Devuelve hasta 20 indicadores con su último valor y fuente.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'Término de búsqueda en lenguaje natural (ej: "pobreza infantil", "mortalidad", "NNyA", "desempleo"). Se busca por coincidencia parcial en el nombre del indicador.',
          },
          categoria: {
            type: 'string',
            description:
              'Categoría para filtrar (opcional). Valores: pobreza, salud, educacion, inversion, demografia, seguridad, justicia.',
          },
        },
        required: ['query'],
      },
    },
  },
];

/**
 * Executes a single indicator tool call by name with the given parameters.
 * Returns the structured result object.
 */
export async function executeIndicatorTool(
  name: string,
  params: Record<string, string>
): Promise<unknown> {
  switch (name) {
    case 'listAvailableIndicators':
      return listAvailableIndicators();

    case 'getLatestIndicatorValue':
      if (!params.indicadorNombre) {
        throw new Error('getLatestIndicatorValue requiere el parámetro "indicadorNombre".');
      }
      return getLatestIndicatorValue(params.indicadorNombre, params.categoria || undefined);

    case 'getIndicatorTimeSeries':
      if (!params.indicadorNombre) {
        throw new Error('getIndicatorTimeSeries requiere el parámetro "indicadorNombre".');
      }
      return getIndicatorTimeSeries(
        params.indicadorNombre,
        params.categoria || undefined,
        params.limit ? parseInt(params.limit, 10) : undefined
      );

    case 'getCategoryOverview':
      if (!params.categoria) {
        throw new Error('getCategoryOverview requiere el parámetro "categoria".');
      }
      return getCategoryOverview(params.categoria);

    case 'getIndicatorBreakdown':
      if (!params.indicadorNombre) {
        throw new Error('getIndicatorBreakdown requiere el parámetro "indicadorNombre".');
      }
      return getIndicatorBreakdown(
        params.indicadorNombre,
        params.categoria || undefined,
        params.desgloseField || undefined
      );

    case 'searchIndicators':
      if (!params.query) {
        throw new Error('searchIndicators requiere el parámetro "query".');
      }
      return searchIndicators(params.query, params.categoria || undefined);

    default:
      throw new Error(`Herramienta desconocida: "${name}".`);
  }
}

// ---------------------------------------------------------------------------
// Public utility: extract data-source metadata from tool results
// ---------------------------------------------------------------------------

/**
 * Extracts `dataSources` references from a tool result object.
 * Used to populate the `dataSources` field in the API response.
 */
export function extractDataSources(
  toolName: string,
  result: unknown
): Array<{ indicador: string; periodo?: string; valor?: number | string }> {
  const sources: Array<{ indicador: string; periodo?: string; valor?: number | string }> = [];

  if (!result || typeof result !== 'object') return sources;

  const r = result as Record<string, unknown>;

  switch (toolName) {
    case 'getLatestIndicatorValue': {
      const indicador = r.indicador as string | undefined;
      const valores = r.valores as IndicatorValue[] | undefined;
      if (indicador && valores && valores.length > 0) {
        sources.push({
          indicador,
          periodo: valores[0].periodo,
          valor: valores[0].valor,
        });
      }
      break;
    }
    case 'getIndicatorTimeSeries': {
      const indicador = r.indicador as string | undefined;
      const cambio = r.cambio_porcentual as number | null | undefined;
      if (indicador) {
        sources.push({
          indicador,
          periodo: cambio !== null ? `Cambio: ${cambio}%` : undefined,
        });
      }
      break;
    }
    case 'getCategoryOverview': {
      const categoria = r.categoria as string | undefined;
      const indicadores = r.indicadores as CategoryIndicator[] | undefined;
      if (categoria && indicadores) {
        for (const ind of indicadores) {
          sources.push({
            indicador: ind.nombre,
            periodo: ind.ultimo_periodo,
            valor: ind.ultimo_valor,
          });
        }
      }
      break;
    }
    case 'getIndicatorBreakdown': {
      const indicador = r.indicador as string | undefined;
      const desgloses = r.desgloses as BreakdownItem[] | undefined;
      if (indicador && desgloses && desgloses.length > 0) {
        sources.push({
          indicador,
          periodo: desgloses[0].periodo,
        });
      }
      break;
    }
    case 'listAvailableIndicators': {
      // Listing doesn't produce specific data-source references
      break;
    }
    case 'searchIndicators': {
      const arr = Array.isArray(r) ? r as unknown as SearchResult[] : undefined;
      if (arr) {
        for (const res of arr) {
          sources.push({
            indicador: res.indicador_nombre,
            periodo: res.ultimo_periodo ?? undefined,
            valor: res.ultimo_valor ?? undefined,
          });
        }
      }
      break;
    }
  }

  return sources;
}
