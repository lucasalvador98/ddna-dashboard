import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { CategoriaIndicador } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoria = searchParams.get("categoria") as CategoriaIndicador | null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 }
    );
  }

  try {
    let query = supabase
      .from("indicadores")
      .select("id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente")
      .order("periodo", { ascending: false });

    if (categoria) {
      query = query.eq("categoria", categoria);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
