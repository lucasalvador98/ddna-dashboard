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
    return NextResponse.json({
      status: "healthy",
      message: "All systems operational.",
      checks,
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