import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ⚠️ CLIENTE PARA BROWSER: SOLO usa anon key (NEXT_PUBLIC_)
// ⚠️ NO usar getSupabaseClient() aca - esa usa service_role (prohibido en browser)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Cliente PARA EL BROWSER (singleton)
let _supabaseBrowser: SupabaseClient | null = null;

function getBrowserClient(): SupabaseClient {
  if (!_supabaseBrowser) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
      );
    }
    _supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabaseBrowser;
}

// Export PARA EL BROWSER (páginas y componentes)
// SOLO usa anon key ✅
export const supabase = getBrowserClient();

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

// Helper para consultas tipadas (páginas del dashboard)
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

// Para APIs de administración (SOLO en API routes, NO en browser)
// Esta función usa service_role y debe llamarse SOLO desde API routes
export function getSupabaseAdminClient(): SupabaseClient {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase admin not configured. Set SUPABASE_SERVICE_ROLE_KEY for API routes"
    );
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
