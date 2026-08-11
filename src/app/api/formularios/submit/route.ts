// POST /api/formularios/submit
//
// Public anonymous submit for a form. Node runtime (in-memory rate limit).
// Security model:
//  - Re-validates the payload server-side (never trusts the client): re-evaluates
//    conditional logic, strips hidden/unknown fields and type-checks.
//  - Inserts with an ANON client so the RLS `INSERT TO anon WITH CHECK (form
//    activo)` policy is the real enforcement backstop. Never service_role here.
// Error strings are Spanish; identifiers/comments in English.

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from '@/lib/agent/rate-limit';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { MAX_PAYLOAD_BYTES } from '@/lib/formularios/defaults';
import { validateDefinition, validateResponse } from '@/lib/formularios/validation';
import type { Formulario } from '@/lib/formularios/types';

export const runtime = 'nodejs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const MAX_REQUESTS_PER_WINDOW = 10;
const WINDOW_MS = 60_000;

interface SubmitPayload {
  slug?: unknown;
  respuestas?: unknown;
}

function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

function clientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_PAYLOAD_BYTES) {
      return jsonError('La solicitud es demasiado grande.', 400);
    }

    let body: SubmitPayload;
    try {
      body = JSON.parse(rawBody) as SubmitPayload;
    } catch {
      return jsonError('Solicitud inválida.', 400);
    }

    const { slug, respuestas } = body;
    if (typeof slug !== 'string' || slug.trim() === '' || !isPlainObject(respuestas)) {
      return jsonError('Solicitud inválida.', 400);
    }

    const rate = checkRateLimit(`submit:${clientIp(request)}:${slug}`, MAX_REQUESTS_PER_WINDOW, WINDOW_MS);
    if (!rate.allowed) {
      return jsonError('Demasiadas solicitudes. Intentá de nuevo en unos minutos.', 429);
    }

    const form = await fetchFormBySlug(slug);
    if (!form || !form.activo) {
      return jsonError('Formulario no disponible.', 404);
    }

    const definition = validateDefinition(form.definicion);
    if (!definition.valid) {
      return jsonError('El formulario tiene un error de configuración.', 500);
    }

    const result = validateResponse(form.definicion, respuestas);
    if (!result.valid) {
      return NextResponse.json(
        { error: 'Algunos campos no son válidos.', errors: result.errors },
        { status: 400 },
      );
    }

    const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { error } = await anon
      .from('respuestas_formulario')
      .insert({ formulario_id: form.id, respuestas: result.answers });

    if (error) {
      // RLS backstop: the form was deactivated between the fetch and the insert.
      if (error.code === '42501' || /row.?level.?security/i.test(error.message)) {
        return jsonError('El formulario no está disponible para recibir respuestas.', 400);
      }
      return jsonError('Error interno del servidor.', 500);
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return jsonError('Error interno del servidor.', 500);
  }
}

async function fetchFormBySlug(slug: string): Promise<Formulario | null> {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from('formularios')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) return null;
  return (data as Formulario) ?? null;
}
