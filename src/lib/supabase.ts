import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
      );
    }

    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

// Convenience export for use in client components and API routes
// Handles missing config gracefully
export const supabase = typeof window !== "undefined" || process.env.NEXT_PUBLIC_SUPABASE_URL
  ? (() => {
      try {
        return getSupabaseClient();
      } catch {
        return null as unknown as SupabaseClient;
      }
    })()
  : null as unknown as SupabaseClient;

export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// Tipos para las tablas principales del dashboard
export type CategoriaIndicador =
  | "salud"
  | "educacion"
  | "pobreza"
  | "seguridad"
  | "inversion"
  | "demografia";

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
  metodo_ingesta: "api" | "manual" | "csv_upload";
  created_at: string;
}

// Helper para consultas tipadas
export async function getIndicadores(categoria?: CategoriaIndicador) {
  let query = supabase
    .from("indicadores")
    .select("*")
    .order("nombre", { ascending: true });

  if (categoria) {
    query = query.eq("categoria", categoria);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching indicadores:", error.message);
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
    .from("datos_indicadores")
    .select("*")
    .eq("indicador_id", indicadorId)
    .order("periodo", { ascending: true });

  if (periodoDesde) {
    query = query.gte("periodo", periodoDesde);
  }
  if (periodoHasta) {
    query = query.lte("periodo", periodoHasta);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching datos:", error.message);
    return [];
  }

  return data as DatoIndicador[];
}

export async function getFuentesDatos(categoria?: CategoriaIndicador) {
  let query = supabase
    .from("fuentes_datos")
    .select("*")
    .order("nombre", { ascending: true });

  if (categoria) {
    query = query.eq("categoria", categoria);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching fuentes:", error.message);
    return [];
  }

  return data as FuenteDato[];
}