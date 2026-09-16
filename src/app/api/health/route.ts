import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    supabase: "disconnected",
    timestamp: new Date().toISOString(),
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json({
      status: "degraded",
      message: "Supabase not configured. Using placeholder data.",
      checks,
    });
  }

  try {
    const { error } = await supabase
      .from("indicadores")
      .select("id")
      .limit(1);

    if (error) {
      checks.supabase = "no_schema";
      return NextResponse.json({
        status: "degraded",
        message: "Supabase connected but schema not deployed. Run migrations first.",
        checks,
      });
    }

    checks.supabase = "connected";

    let perCategory: Record<string, { ultima_carga: string | null; days_since: number | null; stale: boolean }> = {};
    let staleCategories: string[] = [];
    try {
      const { data: rows, error: catError } = await supabase
        .from("vw_category_freshness")
        .select("categoria, ultima_actualizacion, umbral_dias");

      if (!catError && rows) {
        const now = Date.now();
        for (const r of rows as Array<{ categoria: string; ultima_actualizacion: string | null; umbral_dias: number | null }>) {
          const ultima = r.ultima_actualizacion;
          const days = ultima ? Math.floor((now - new Date(ultima).getTime()) / (1000 * 60 * 60 * 24)) : null;
          const threshold = typeof r.umbral_dias === "number" ? r.umbral_dias : null;
          const stale = threshold !== null && (days === null || days > threshold);
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
    // PostgREST cold start or network error — return 200 so the container
    // healthcheck doesn't kill the pod during startup.
    checks.supabase = "starting";
    return NextResponse.json({
      status: "starting",
      message: "Supabase not ready yet (cold start). Container is healthy.",
      checks,
    });
  }
}