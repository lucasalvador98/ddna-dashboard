import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

// ⚠️ CLIENTE PARA BROWSER: SOLO usa anon key (NEXT_PUBLIC_)
// ⚠️ NO usar getSupabaseClient() aca - esa usa service_role (prohibido en browser)

// ── Single browser client singleton ─────────────────────────────────────────
// Uses createBrowserClient from @supabase/ssr for proper cookie handling.
// Safe during SSR — createBrowserClient guards against missing browser APIs
// (typeof document === 'undefined' checks). This is the ONE and ONLY client
// for all browser-side supabase operations (auth + data queries).
// NOTE: env is read lazily inside the function (not at module top-level)
// so that Docker builds with ARG and runtime env both work correctly.

let _supabaseClient: SupabaseClient | null = null;
let _cachedUrl: string | null = null;
let _cachedAnonKey: string | null = null;

/** Get the ONE shared browser client. Safe for both SSR and browser. */
export function getBrowserClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // If env changed (e.g. after a rebuild), invalidate the cached client
  if (_supabaseClient && (_cachedUrl !== supabaseUrl || _cachedAnonKey !== supabaseAnonKey)) {
    _supabaseClient = null;
  }

  if (!_supabaseClient) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
      );
    }
    _supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
    _cachedUrl = supabaseUrl;
    _cachedAnonKey = supabaseAnonKey;
  }
  return _supabaseClient;
}

// Export PARA EL BROWSER (páginas y componentes)
// SOLO usa anon key ✅
// Lazy Proxy — no crea el cliente al importar el módulo (evita "Multiple GoTrueClient instances"
// en HMR y en SSR). La primera vez que se accede a `supabase.from()` se crea el singleton.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getBrowserClient();
    const value = Reflect.get(client as unknown as Record<string, unknown>, prop);
    // Si es función, bindearla al cliente original
    if (typeof value === 'function') return value.bind(client);
    return value;
  },
}) as SupabaseClient;

// Tipos para las tablas principales del dashboard
export type CategoriaIndicador =
  | 'salud'
  | 'educacion'
  | 'pobreza'
  | 'seguridad'
  | 'inversion'
  | 'demografia'
  | 'anuario_educacion'
  | 'aprender'
  | 'consumo'
  | 'deis'
  | 'justicia'
  | 'salud_adolescente'
  | 'encuestas_2024'
  | 'canastas'
  | 'empleo'
  | 'precios'
  | 'senaf';

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

// Check if Supabase is configured (reads env lazily at call time)
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return !!(url && anonKey);
}

// Para APIs de administración (SOLO en API routes, NO en browser)
// Esta función usa service_role y debe llamarse SOLO desde API routes
// Reads env at call time so Docker runtime env is respected.
export function getSupabaseAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase admin not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for API routes');
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
