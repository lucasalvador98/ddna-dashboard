/**
 * POST /api/repositorio/informe-ejecutivo
 *
 * Generates an AI-powered executive/critical report using gpt-4o-mini.
 * Gathers from 3 sources in parallel: indicators + doc_chunks + web context.
 * Accepts a list of categories and returns a structured CriticalReport.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  buildReportPayload,
  buildSystemPrompt,
  ALL_CATEGORIES,
  expandAxesToCategories,
  searchDocuments,
  searchWebContext,
  type IndicadorRow,
} from '@/lib/informe-ejecutivo';
import { withRateLimit } from '@/lib/agent/rate-limit';

// ─── Configuration ──────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = 'gpt-4o-mini';
const MAX_RETRIES = 3;

// ─── Types ──────────────────────────────────────────────────────

interface RequestBody {
  axes?: string[];
}

// ─── LLM Call Helper ────────────────────────────────────────────

/**
 * Call OpenAI with a system prompt + user payload.
 * Retries on rate limit (429) with exponential backoff.
 */
async function callLLM(
  systemPrompt: string,
  userPayload: string,
): Promise<string> {
  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      // Exponential backoff: 1s, 3s, 7s
      const delay = Math.pow(2, attempt + 1) * 1000 - 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPayload },
          ],
          temperature: 0.3,
          max_tokens: 8000,
          response_format: { type: 'json_object' as const },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data?.choices?.[0]?.message?.content || '';
      }

      // Extract error
      let msg = `HTTP ${response.status}`;
      try {
        const errorBody = await response.json();
        msg = errorBody?.error?.message || msg;
      } catch {
        msg = `HTTP ${response.status} - Error desconocido`;
      }

      // Retry only on rate limit
      const isRateLimit =
        response.status === 429 ||
        msg.toLowerCase().includes('rate limit') ||
        msg.toLowerCase().includes('rate_limit');

      if (!isRateLimit) {
        throw new Error(`Error de OpenAI: ${msg}`);
      }

      lastError = new Error(`Error de OpenAI: ${msg}`);
      console.warn(`Rate limit en intento ${attempt + 1}/${MAX_RETRIES}`);
    } catch (err) {
      if (
        err instanceof Error &&
        (err.message.includes('rate limit') ||
          err.message.includes('rate_limit') ||
          err.message.includes('Rate limit'))
      ) {
        lastError = err;
        console.warn(`Rate limit en intento ${attempt + 1}/${MAX_RETRIES}`);
        continue;
      }
      throw err;
    }
  }

  throw (
    lastError ||
    new Error('Error al generar el informe: máximo de reintentos alcanzado')
  );
}

// ─── Supabase Query Helper ──────────────────────────────────────

interface RawIndicadorRow {
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

async function fetchIndicators(
  categories: string[],
): Promise<IndicadorRow[]> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const activeCategories =
    categories.length > 0 ? categories : [...ALL_CATEGORIES];

  // Use v_informe_contexto: excludes duplicate justicia rows (es_duplicado=true)
  // and only returns active indicators via the view's WHERE activo=true filter.
  const { data, error } = await supabase
    .from('v_informe_contexto')
    .select('id, titulo, categoria_db, contenido, fuente, periodo, ejes_relacionados')
    .eq('tipo', 'indicador')
    .eq('es_duplicado', false)
    .in('categoria_db', activeCategories)
    .order('periodo', { ascending: false });

  if (error) {
    console.error('Error fetching indicators:', error);
    throw new Error('Error al consultar indicadores en Supabase');
  }

  return (data || []).map((row: Record<string, unknown>) => {
    // contenido format: "categoria | nombre | valor: X unidad | período: P | región: R"
    // We re-parse into IndicadorRow fields from the view columns
    const content = String(row.contenido ?? '');
    const parts = content.split(' | ');
    const valorPart = parts[2] ?? '';
    const valorMatch = valorPart.match(/valor:\s*([\d.,]+)\s*(.*)/);
    const valor = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : 0;
    const unidad = valorMatch ? valorMatch[2].trim() : '';

    return {
      id: String(row.id ?? ''),
      indicador_nombre: String(row.titulo ?? ''),
      categoria: String(row.categoria_db ?? ''),
      valor,
      unidad,
      periodo: String(row.periodo ?? ''),
      region: parts[4]?.replace('región: ', '').trim() ?? 'Córdoba',
      desglose: {},
      fuente: String(row.fuente ?? ''),
    } satisfies IndicadorRow;
  });
}

// ─── POST Handler ───────────────────────────────────────────────

async function handleInformeEjecutivoPOST(request: Request) {
  try {
    // --- Check API key ---
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            'No hay API key configurada para OpenAI. Configurá OPENAI_API_KEY en .env.local',
        },
        { status: 500 },
      );
    }

    // --- Parse body ---
    let body: RequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'El cuerpo de la solicitud debe ser JSON válido' },
        { status: 400 },
      );
    }

    // --- Validate axes ---
    const axes = body.axes;
    if (axes !== undefined) {
      if (!Array.isArray(axes) || !axes.every((a) => typeof a === 'string')) {
        return NextResponse.json(
          { error: 'axes debe ser un array de strings (ej: ["educacion", "salud"])' },
          { status: 400 },
        );
      }
    }

    // Expand thematic axes to actual DB categories
    const activeCategories = expandAxesToCategories(axes ?? []);

    // ── Phase 1: Fetch indicators ─────────────────────────────
    const indicators = await fetchIndicators(activeCategories);

    if (indicators.length === 0) {
      return NextResponse.json(
        {
          error:
            'No se encontraron indicadores para las categorías seleccionadas',
        },
        { status: 404 },
      );
    }

    // ── Phase 2: Multi-source gathering (parallel) ────────────
    // Deduplicate to one query per thematic axis — multiple DB categories
    // (e.g. educacion + aprender + anuario_educacion) map to the same axis
    // in v_informe_contexto, so we avoid redundant queries.
    const searchClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const DB_TO_AXIS: Record<string, string> = {
      educacion: 'educacion', aprender: 'educacion', anuario_educacion: 'educacion',
      salud: 'salud', salud_adolescente: 'salud', deis: 'salud',
      pobreza: 'pobreza', consumo: 'pobreza',
      inversion: 'inversion',
      seguridad: 'seguridad_justicia', justicia: 'seguridad_justicia',
      demografia: 'demografia',
    };
    const uniqueAxes = [...new Set(activeCategories.map((cat) => DB_TO_AXIS[cat] ?? cat))];

    const [docSettled, webSettled] = await Promise.allSettled([
      Promise.all(uniqueAxes.map((axis) => searchDocuments(searchClient, axis))),
      Promise.all(uniqueAxes.map((axis) => searchWebContext(axis))),
    ]);

    const documents =
      docSettled.status === 'fulfilled'
        ? docSettled.value.flat()
        : [];
    const webContext =
      webSettled.status === 'fulfilled'
        ? webSettled.value.flat()
        : [];

    // ── Phase 3: Build enriched payload ───────────────────────
    const payload = buildReportPayload(activeCategories, indicators);
    const enrichedPayload = {
      indicators: payload,
      documents: documents.slice(0, 20),
      webContext: webContext.slice(0, 15),
    };
    const systemPrompt = buildSystemPrompt();

    // ── Phase 4: Call OpenAI ──────────────────────────────────
    const llmResponse = await callLLM(
      systemPrompt,
      JSON.stringify(enrichedPayload),
    );

    // ── Phase 5: Parse response ───────────────────────────────
    let report: Record<string, unknown>;
    try {
      report = JSON.parse(llmResponse);
    } catch {
      return NextResponse.json(
        { error: 'Error al parsear la respuesta de OpenAI' },
        { status: 502 },
      );
    }

    // ── Phase 6: Return structured response with all fields ──
    return NextResponse.json({
      report: {
        title: report.title || 'Informe Ejecutivo DDNA',
        date: report.date || new Date().toLocaleDateString('es-AR'),
        overview: report.overview || '',
        kpis: report.kpis || [],
        sections: report.sections || [],
        conclusion: report.conclusion || '',
        recommendations: report.recommendations || [],
        dataQuality: report.dataQuality || [],
        discrepancies: report.discrepancies || [],
        crossReferences: report.crossReferences || [],
        suggestedImprovements: report.suggestedImprovements || [],
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Informe ejecutivo error:', err);
    const message =
      err instanceof Error ? err.message : 'Error interno del servidor';

    // Map known errors to appropriate status codes
    if (message.includes('OpenAI') || message.includes('reintentos')) {
      return NextResponse.json({ error: message }, { status: 502 });
    }

    return NextResponse.json(
      { error: `Error interno: ${message}` },
      { status: 500 },
    );
  }
}

// Exported with rate limiting (15 requests/min per IP — informe is expensive)
export const POST = withRateLimit(handleInformeEjecutivoPOST, {
  maxRequests: 15,
  windowMs: 60_000,
  keyPrefix: 'repositorio-informe',
});
