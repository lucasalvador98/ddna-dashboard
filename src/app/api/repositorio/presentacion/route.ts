/**
 * POST /api/repositorio/presentacion
 *
 * Generates an AI-powered slide presentation using gpt-4o-mini.
 * Fetches enriched KPIs from v_kpis_presentacion for selected KPI names,
 * then builds a structured JSON presentation of 10-15 slides.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  buildPresentationSystemPrompt,
  buildPresentationUserPayload,
  type KpiRow,
  type PresentationContext,
  type PresentationReport,
} from '@/lib/presentacion-ia';
import { withRateLimit } from '@/lib/agent/rate-limit';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = 'gpt-4o-mini';
const MAX_RETRIES = 3;

// ─── Types ──────────────────────────────────────────────────────

interface GrupoInput {
  titulo: string;
  tipo_viz: string;
  es_grupo: boolean;
  kpi_nombres: string[];
}

interface RequestBody {
  /** Flat list of all KPI names (used for DB fetch) */
  kpi_nombres: string[];
  /** Grouped structure for the AI prompt */
  grupos: GrupoInput[];
  /** Optional: filter by region (defaults to 'Córdoba') */
  region?: string;
  /** User-provided context for the presentation */
  context: PresentationContext;
}

// ─── LLM Helper ─────────────────────────────────────────────────

async function callLLM(systemPrompt: string, userPayload: string): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = Math.pow(2, attempt + 1) * 1000 - 1000;
      await new Promise(r => setTimeout(r, delay));
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
          temperature: 0.4,
          max_tokens: 16000,
          response_format: { type: 'json_object' as const },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data?.choices?.[0]?.message?.content || '';
      }

      let msg = `HTTP ${response.status}`;
      try {
        const errorBody = await response.json();
        msg = errorBody?.error?.message || msg;
      } catch {
        /* ignore */
      }

      const isRateLimit =
        response.status === 429 ||
        msg.toLowerCase().includes('rate limit') ||
        msg.toLowerCase().includes('rate_limit');

      if (!isRateLimit) throw new Error(`Error de OpenAI: ${msg}`);
      lastError = new Error(`Error de OpenAI: ${msg}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('rate limit') || msg.includes('rate_limit') || msg.includes('Rate limit')) {
        lastError = err as Error;
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('Máximo de reintentos alcanzado');
}

// ─── Supabase Fetch ──────────────────────────────────────────────

async function fetchKpis(nombres: string[], _region: string): Promise<KpiRow[]> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Fetch ALL rows matching the selected KPI names (all regions).
  // The view already deduplicates to one row per nombre+region.
  // We then keep the best row per nombre: provincial > nacional > departamental.
  const { data, error } = await supabase
    .from('v_kpis_presentacion')
    .select('*')
    .in('nombre', nombres);

  if (error) {
    console.error('Error fetching KPIs:', error);
    throw new Error('Error al consultar KPIs en Supabase');
  }

  const rows = (data || []) as KpiRow[];

  // Deduplicate: per nombre keep provincial first, then nacional, then departamental.
  // This ensures UCA (nacional) and DDNA encuestas (provincial) both survive.
  const PRIORITY: Record<string, number> = { provincial: 0, nacional: 1, departamental: 2 };
  const best = new Map<string, KpiRow>();
  for (const row of rows) {
    const existing = best.get(row.nombre);
    const rowP = PRIORITY[(row as KpiRow & { alcance?: string }).alcance ?? ''] ?? 99;
    const existP = existing
      ? (PRIORITY[(existing as KpiRow & { alcance?: string }).alcance ?? ''] ?? 99)
      : 99;
    if (!existing || rowP < existP) best.set(row.nombre, row);
  }

  return Array.from(best.values());
}

// ─── POST Handler ────────────────────────────────────────────────

async function handlePresentacionPOST(request: Request) {
  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'No hay API key configurada para OpenAI. Configurá OPENAI_API_KEY en .env.local' },
        { status: 500 },
      );
    }

    let body: RequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'El cuerpo de la solicitud debe ser JSON válido' },
        { status: 400 },
      );
    }

    // Validate
    if (!Array.isArray(body.kpi_nombres) || body.kpi_nombres.length === 0) {
      return NextResponse.json(
        { error: 'kpi_nombres debe ser un array de strings no vacío' },
        { status: 400 },
      );
    }
    if (!body.context?.titulo || !body.context?.tematica) {
      return NextResponse.json(
        { error: 'context.titulo y context.tematica son requeridos' },
        { status: 400 },
      );
    }
    if (body.kpi_nombres.length > 30) {
      return NextResponse.json(
        { error: 'Máximo 30 KPIs por presentación' },
        { status: 400 },
      );
    }

    const region = body.region || 'Córdoba';
    const kpis = await fetchKpis(body.kpi_nombres, region);

    if (kpis.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron datos para los KPIs seleccionados' },
        { status: 404 },
      );
    }

    const fecha = new Date().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const systemPrompt = buildPresentationSystemPrompt();
    const userPayload = buildPresentationUserPayload(body.context, kpis, fecha, body.grupos);

    const rawJson = await callLLM(systemPrompt, userPayload);

    let presentation: PresentationReport;
    try {
      presentation = JSON.parse(rawJson) as PresentationReport;
    } catch {
      console.error('JSON parse error. Raw response:', rawJson.slice(0, 500));
      return NextResponse.json(
        { error: 'La IA devolvió una respuesta con formato inválido. Reintentá.' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      presentation,
      generatedAt: new Date().toISOString(),
      kpis_usados: kpis.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error('Error en /api/repositorio/presentacion:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const POST = withRateLimit(handlePresentacionPOST);
