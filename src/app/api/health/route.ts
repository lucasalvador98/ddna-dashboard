import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const checks = {
    supabase: "disconnected",
    timestamp: new Date().toISOString(),
  };

  // Check if Supabase URL is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json({
      status: "degraded",
      message: "Supabase not configured. Using placeholder data.",
      checks,
    });
  }

  try {
    // Test connection by querying a simple table
    const { error } = await supabase
      .from("indicadores")
      .select("id")
      .limit(1);

    if (error) {
      // Table doesn't exist yet — migration not run
      checks.supabase = "no_schema";
      return NextResponse.json({
        status: "degraded",
        message: "Supabase connected but schema not deployed. Run migrations first.",
        checks,
      });
    }

    checks.supabase = "connected";

    // Per-category staleness check
    let perCategory: Record<string, { ultima_carga: string | null; days_since: number | null; stale: boolean }> = {};
    let staleCategories: string[] = [];
    try {
      // Consulta la vista agregada (una fila por categoría con el max de
      // ultima_actualizacion). Consultar la tabla completa estaba acotado
      // por PGRST_DB_MAX_ROWS (1000) y ocultaba categorías stale.
      const { data: rows, error: catError } = await supabase
        .from("vw_category_freshness")
        .select("categoria, ultima_actualizacion");

      if (!catError && rows) {
        const now = Date.now();
        for (const r of rows as Array<{ categoria: string; ultima_actualizacion: string | null }>) {
          const ultima = r.ultima_actualizacion;
          const days = ultima ? Math.floor((now - new Date(ultima).getTime()) / (1000 * 60 * 60 * 24)) : null;
          // umbral: 45 días general, 90 para consumo (datos esporádicos)
          const threshold = r.categoria === "consumo" ? 90 : 45;
          const stale = days !== null ? days > threshold : true;
          perCategory[r.categoria] = { ultima_carga: ultima, days_since: days, stale };
          if (stale) staleCategories.push(r.categoria);
        }
      }
    } catch {
      // ignore per-category errors, keep basic health
    }

    const hasStale = staleCategories.length > 0;
    return NextResponse.json({
      status: hasStale ? "degraded" : "healthy",
      message: hasStale
        ? `Stale categories: ${staleCategories.join(", ")}`
        : "All systems operational.",
      checks: { ...checks, perCategory, staleCategories },
    });
  } catch {
    checks.supabase = "error";
    return NextResponse.json(
      {
        status: "unhealthy",
        message: "Cannot connect to Supabase. Check credentials.",
        checks,
      },
      { status: 503 }
    );
  }
}