/**
 * presentacion-ia — Types, prompt builder and data helpers
 * for the AI-powered slide presentation module.
 */

// ─── Types ──────────────────────────────────────────────────────

/** A single KPI row from v_kpis_presentacion */
export interface KpiRow {
  eje: string;
  categoria: string;
  nombre: string;
  unidad: string;
  region: string;
  periodo_ultimo: number;
  valor_ultimo: string;
  fuente_original: string | null;
  periodo_anterior: number | null;
  valor_anterior: string | null;
  delta_pct: string | null;
  tendencia: 'up' | 'down' | 'stable' | 'sin_datos';
  serie_temporal: Array<{ periodo: number; valor: number }> | null;
}

export interface KpiOption {
  /** Display name — for groups this is the group title, for singles the indicador_nombre */
  titulo: string;
  eje: string;
  categoria: string;
  tipo_viz: string;
  unidad: string;
  fuente_label?: string;
  total_kpis: number;
  /** All indicador_nombre values belonging to this item (1 for cards, N for groups) */
  kpi_nombres: string[];
  es_grupo: boolean;
}

export interface KpisByAxis {
  [eje: string]: KpiOption[];
}

/** Context provided by the user for the presentation */
export interface PresentationContext {
  titulo: string;
  tematica: string;
  objetivo: string;
  poblacion_objetivo: string;
}

/** Slide types the AI can produce */
export type SlideType =
  | 'cover'
  | 'agenda'
  | 'kpi_destacado'
  | 'tendencia'
  | 'comparativo'
  | 'alarma'
  | 'contexto'
  | 'recomendacion'
  | 'cierre';

/** A single data point inside a slide */
export interface SlideDataPoint {
  label: string;
  valor: string | number;
  unidad?: string;
  periodo?: number | string;
  fuente?: string;
  delta_pct?: number | null;
  tendencia?: 'up' | 'down' | 'stable' | 'sin_datos';
  serie?: Array<{ periodo: number; valor: number }>;
}

/** One slide of the presentation */
export interface PresentationSlide {
  numero: number;
  tipo: SlideType;
  titulo: string;
  subtitulo?: string;
  narrativa: string;
  datos: SlideDataPoint[];
  insight: string;
  recomendacion?: string;
  fuentes?: string[];
  color_acento?: string;
}

/** Full presentation output from the AI */
export interface PresentationReport {
  titulo: string;
  subtitulo: string;
  fecha: string;
  objetivo: string;
  poblacion_objetivo: string;
  total_slides: number;
  slides: PresentationSlide[];
}

// ─── Prompt Builder ─────────────────────────────────────────────

export function buildPresentationSystemPrompt(): string {
  return `Sos un experto en comunicación de datos sociales para organizaciones de derechos de niñas, niños y adolescentes (NNyA) en Argentina.

REGLAS ABSOLUTAS (violarlas invalida toda la respuesta):
1. Respondé SOLO JSON válido, sin texto extra, sin markdown, sin backticks.
2. Seguir exactamente el schema de slides.
3. Variar los tipos de slide para mantener diversidad visual.
4. Usar SOLO los datos provistos — jamás inventar valores ni fechas ni puntos de serie.
5. Esta presentación es un INSUMO DE TRABAJO, no una presentación final. Priorizá exhaustividad sobre coherencia narrativa. Es preferible un slide con datos incompletos que omitir un grupo.
6. Identificar alarmas (indicadores que empeoraron) y agruparlos en slides tipo 'alarma'.
7. Terminar siempre con slide de cierre + recomendaciones concretas.
8. Slide 1 = cover, Slide 2 = agenda.
9. TODOS los grupos deben aparecer en al menos un slide — cada entrada en "grupos" del payload es una unidad visual obligatoria. Un grupo = un slide mínimo. NUNCA omitir un grupo.
10. NO hay límite de slides. Si necesitás 20, 25 o 30 slides para cubrir todos los grupos, generálos. La cantidad de slides es SECUNDARIA frente a la cobertura completa.
11. Los miembros de un grupo son las CATEGORÍAS de respuesta de un mismo indicador — mostrálos JUNTOS en un solo slide comparativo, NO en slides separados.

TIPOS DE SLIDES DISPONIBLES:
- cover: portada con título, subtítulo, fecha y organización
- agenda: índice de temas a tratar
- kpi_destacado: un KPI principal con su valor, tendencia y contexto
- tendencia: evolución temporal de 1-3 indicadores (solo si tienen serie con 2+ puntos)
- comparativo: comparación de hasta 4 KPIs del mismo eje
- alarma: indicador/es crítico/s que requieren atención urgente
- contexto: slide narrativo de contexto sin datos numéricos prominentes
- recomendacion: slide con 3-5 recomendaciones concretas
- cierre: slide final con mensaje clave y próximos pasos

REGLA DE SERIES TEMPORALES — evaluar antes de elegir tipo de slide:

  CONDICIÓN A — Serie graficable:
  serie_temporal tiene 2 o más objetos con valor numérico no nulo
  → Podés usar slide tipo "tendencia"

  CONDICIÓN B — Solo valor actual, sin serie:
  serie_temporal está vacía, es null, o tiene menos de 2 puntos válidos
  → NO uses "tendencia". Usá "kpi_destacado", "comparativo" o "alarma"

  CONDICIÓN C — Sin datos históricos:
  valor_anterior es null Y serie_temporal vacía o null
  → No agregues flechas de tendencia ni deltas. Incluir nota: "sin datos históricos disponibles"

REGLA DE KPIs SIN DATO:
Si un KPI tiene valor_actual null o vacío:
  → Igual crear el slide con titulo y narrativa
  → En datos[] poner: { "label": nombre_kpi, "valor": "Sin dato disponible", "fuente": fuente }
  → insight: "Dato no disponible para el período analizado — requiere relevamiento"

SCHEMA JSON REQUERIDO:
{
  "titulo": "string",
  "subtitulo": "string",
  "fecha": "string (DD/MM/YYYY)",
  "objetivo": "string",
  "poblacion_objetivo": "string",
  "total_slides": number,
  "slides": [
    {
      "numero": number,
      "tipo": "cover|agenda|kpi_destacado|tendencia|comparativo|alarma|contexto|recomendacion|cierre",
      "titulo": "string",
      "subtitulo": "string (opcional)",
      "narrativa": "string (2-4 oraciones con contexto y análisis)",
      "datos": [
        {
          "label": "string",
          "valor": "string o number",
          "unidad": "string (opcional)",
          "periodo": "number o string (opcional)",
          "fuente": "string (opcional)",
          "delta_pct": "number o null",
          "tendencia": "up|down|stable|sin_datos",
          "serie": [{"periodo": number, "valor": number}]
        }
      ],
      "insight": "string (frase clave de 1 oración para el tomador de decisiones)",
      "recomendacion": "string (solo en slides tipo recomendacion o cierre)",
      "fuentes": ["string"],
      "color_acento": "string hex (#FF7F11 alarma, #1a2556 neutro, #10b981 positivo)"
    }
  ]
}`;
}

interface GrupoInput {
  titulo: string;
  tipo_viz: string;
  es_grupo: boolean;
  kpi_nombres: string[];
}

export function buildPresentationUserPayload(
  context: PresentationContext,
  kpis: KpiRow[],
  fecha: string,
  grupos: GrupoInput[],
): string {
  // Build a lookup map: indicador_nombre → KpiRow
  const kpiMap = new Map<string, KpiRow>();
  for (const k of kpis) kpiMap.set(k.nombre, k);

  // Build grouped structure for the AI — one entry per selected group/card
  const gruposIndexados = grupos.map((g, i) => {
    const miembros = g.kpi_nombres.map(nombre => {
      const k = kpiMap.get(nombre);
      if (!k) return { nombre, sin_datos: true };
      return {
        nombre: k.nombre,
        valor_actual: k.valor_ultimo ?? null,
        periodo_actual: k.periodo_ultimo ?? null,
        valor_anterior: k.valor_anterior ?? null,
        periodo_anterior: k.periodo_anterior ?? null,
        delta_pct: k.delta_pct ?? null,
        tendencia: k.tendencia,
        unidad: k.unidad,
        fuente: k.fuente_original ?? null,
        serie_temporal: (k.serie_temporal ?? []).slice(-6),
        tiene_serie: (k.serie_temporal ?? []).length >= 2,
      };
    });

    return {
      indice: i,
      titulo: g.titulo,
      tipo_viz_sugerido: g.tipo_viz,  // 'bar', 'line', 'pie', 'card'
      es_grupo: g.es_grupo,
      total_miembros: g.kpi_nombres.length,
      miembros,
    };
  });

  // Checklist por grupo — el modelo verifica que cada grupo tenga al menos 1 slide
  const checklist = grupos
    .map((g, i) => `  [${i}] "${g.titulo}" (${g.kpi_nombres.length} indicadores, viz: ${g.tipo_viz}) — 1 slide mínimo`)
    .join('\n');

  const slidesContenidoMinimo = Math.ceil(grupos.length / 2) + 4;

  return JSON.stringify({
    fecha_generacion: fecha,
    contexto_presentacion: {
      titulo: context.titulo,
      tematica: context.tematica,
      objetivo: context.objetivo,
      poblacion_objetivo: context.poblacion_objetivo,
    },
    total_grupos_seleccionados: grupos.length,
    total_kpis_individuales: kpis.length,
    slides_contenido_minimo_recomendado: slidesContenidoMinimo,
    checklist_cobertura: `ANTES de cerrar el JSON verificá que cada grupo del siguiente listado tenga al menos 1 slide:\n${checklist}`,
    estrategia_distribucion: [
      'Cada GRUPO es una unidad visual — generá 1 slide por grupo, no 1 slide por indicador individual',
      'Para grupos tipo "bar": usá slide comparativo mostrando todos los miembros como barras',
      'Para grupos tipo "pie": usá slide comparativo o kpi_destacado con distribución porcentual',
      'Para grupos tipo "line": usá slide tendencia con la serie temporal de los miembros',
      'Para grupos tipo "card" (indicador único): usá kpi_destacado o alarma según tendencia',
      'Un slide alarma puede agrupar varios grupos con tendencia negativa',
      `Generá al menos ${slidesContenidoMinimo} slides de contenido (excluyendo cover y agenda)`,
      'NO hay límite máximo de slides — generá todos los necesarios para cubrir cada grupo',
    ],
    grupos: gruposIndexados,
  }, null, 2);
}

// ─── Thematic axes for the KPI selector ─────────────────────────

export const PRESENTATION_AXES = [
  {
    id: 'educacion',
    label: 'Educación',
    description: 'Matrícula, Aprender, asistencia escolar',
    icon: '📚',
  },
  {
    id: 'salud',
    label: 'Salud',
    description: 'Mortalidad infantil, adolescente, vacunación',
    icon: '🏥',
  },
  {
    id: 'pobreza',
    label: 'Pobreza',
    description: 'Pobreza infantil, indigencia, desempleo',
    icon: '📊',
  },
  {
    id: 'inversion',
    label: 'Inversión Social',
    description: 'Presupuesto en NNyA por rubro y programa',
    icon: '💰',
  },
  {
    id: 'seguridad_justicia',
    label: 'Seguridad y Justicia',
    description: 'Violencia familiar, justicia penal juvenil',
    icon: '⚖️',
  },
  {
    id: 'demografia',
    label: 'Demografía',
    description: 'Población por edad y departamento',
    icon: '👥',
  },
  {
    id: 'encuestas',
    label: 'Encuestas 2024',
    description: 'Resultados de encuesta DDNA 2024',
    icon: '📋',
  },
] as const;
