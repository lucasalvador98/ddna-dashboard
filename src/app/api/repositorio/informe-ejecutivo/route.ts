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
  searchDocuments,
  searchWebContext,
  type IndicadorRow,
} from '@/lib/informe-ejecutivo';

// ─── Configuration ──────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = 'gpt-4o-mini';
const MAX_RETRIES = 3;

// ─── Types ──────────────────────────────────────────────────────

interface RequestBody {
  categories?: string[];
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
          max_tokens: 4000,
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

  // Fetch all indicators for the selected categories
  const { data, error } = await supabase
    .from('indicadores')
    .select(
      'id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente',
    )
    .in('categoria', activeCategories)
    .order('periodo', { ascending: false });

  if (error) {
    console.error('Error fetching indicators:', error);
    throw new Error('Error al consultar indicadores en Supabase');
  }

  return (data || []).map((row: RawIndicadorRow) => ({
    id: row.id,
    indicador_nombre: row.indicador_nombre,
    categoria: row.categoria,
    valor: row.valor,
    unidad: row.unidad,
    periodo: String(row.periodo), // el DB puede devolver número o string
    region: row.region,
    desglose: row.desglose || {},
    fuente: row.fuente,
  }));
}

// ─── POST Handler ───────────────────────────────────────────────

export async function POST(request: Request) {
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

    // --- Validate categories ---
    const categories = body.categories;
    if (categories !== undefined) {
      if (
        !Array.isArray(categories) ||
        !categories.every((c) => typeof c === 'string')
      ) {
        return NextResponse.json(
          {
            error:
              'categories debe ser un array de strings (ej: ["salud", "educacion"])',
          },
          { status: 400 },
        );
      }
    }

    const activeCategories = categories ?? [];

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
    const searchClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const [docSettled, webSettled] = await Promise.allSettled([
      Promise.all(
        activeCategories.map((cat) => searchDocuments(searchClient, cat)),
      ),
      Promise.all(
        activeCategories.map((cat) => searchWebContext(cat)),
      ),
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
        // ExecutiveReport fields
        title: report.title || 'Informe Ejecutivo DDNA',
        date: report.date || new Date().toLocaleDateString('es-AR'),
        overview: report.overview || '',
        sections: report.sections || [],
        conclusion: report.conclusion || '',
        recommendations: report.recommendations || [],
        // CriticalReport fields (optional — may be absent in simple exec reports)
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
