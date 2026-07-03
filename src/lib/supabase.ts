import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

// ⚠️ CLIENTE PARA BROWSER: SOLO usa anon key (NEXT_PUBLIC_)
// ⚠️ NO usar getSupabaseClient() aca - esa usa service_role (prohibido en browser)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// ── Browser client singleton (cookie-based, for AuthProvider + Login) ────────
// Uses @supabase/ssr createBrowserClient so cookies are set correctly
// for middleware session checks. Only ONE instance across the entire app.
// IMPORTANT: Do NOT call this at module level — only from 'use client' components.
// The module-level 'supabase' export uses createClient (SSR-safe) instead.

let _supabaseClient: SupabaseClient | null = null;

/** Get the shared browser client (createBrowserClient from @supabase/ssr).
 *  Only call this from 'use client' components — it needs browser APIs.
 *  AuthProvider and Login page use this to keep ONE instance. */
export function getBrowserClient(): SupabaseClient {
  if (!_supabaseClient) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
      );
    }
    _supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabaseClient;
}

// Export PARA EL BROWSER (páginas y componentes)
// SOLO usa anon key ✅
// Uses createClient (NOT createBrowserClient) because this is called at
// module-import time, which can happen during SSR where browser APIs don't exist.
// This is safe for both server and client execution.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para las tablas principales del dashboard
export type CategoriaIndicador =
  | 'salud'
  | 'educacion'
  | 'pobreza'
  | 'seguridad'
  | 'inversion'
  | 'demografia';

export interface Indicador {
  id: string;
  categoria: CategoriaIndicador;
  nombre: string;
  descripcion: string;
  unidad: string;
  fuente: string;
  frecuencia_actualizacion: string;
  created_at: string;
  updated_at: string;
}

export interface DatoIndicador {
  id: string;
  indicador_id: string;
  valor: number;
  periodo: string;
  region: string;
  desglose: Record<string, string> | null;
  created_at: string;
}

export interface FuenteDato {
  id: string;
  nombre: string;
  organizacion: string;
  url: string;
  frecuencia: string;
  categoria: CategoriaIndicador;
  ultima_actualizacion: string;
  metodo_ingesta: 'api' | 'manual' | 'csv_upload';
  created_at: string;
}

// Helper para consultas tipadas (páginas del dashboard)
export async function getIndicadores(categoria?: CategoriaIndicador) {
  let query = supabase.from('indicadores').select('*').order('nombre', { ascending: true });

  if (categoria) {
    query = query.eq('categoria', categoria);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching indicadores:', error.message);
    return [];
  }

  return data as Indicador[];
}

export async function getDatosIndicador(
  indicadorId: string,
  periodoDesde?: string,
  periodoHasta?: string
) {
  let query = supabase
    .from('datos_indicadores')
    .select('*')
    .eq('indicador_id', indicadorId)
    .order('periodo', { ascending: true });

  if (periodoDesde) {
    query = query.gte('periodo', periodoDesde);
  }
  if (periodoHasta) {
    query = query.lte('periodo', periodoHasta);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching datos:', error.message);
    return [];
  }

  return data as DatoIndicador[];
}

export async function getFuentesDatos(categoria?: CategoriaIndicador) {
  let query = supabase.from('fuentes_datos').select('*').order('nombre', { ascending: true });

  if (categoria) {
    query = query.eq('categoria', categoria);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching fuentes:', error.message);
    return [];
  }

  return data as FuenteDato[];
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

// Para APIs de administración (SOLO en API routes, NO en browser)
// Esta función usa service_role y debe llamarse SOLO desde API routes
export function getSupabaseAdminClient(): SupabaseClient {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase admin not configured. Set SUPABASE_SERVICE_ROLE_KEY for API routes');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Alias for getSupabaseAdminClient (legacy compatibility)
export const getSupabaseClient = getSupabaseAdminClient;
