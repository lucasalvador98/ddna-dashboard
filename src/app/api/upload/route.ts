import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Supabase no configurado. Configure las variables de entorno." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { indicador_id, rows } = body as {
      indicador_id: string;
      rows: Array<{
        valor: number;
        periodo: string;
        region: string;
        desglose?: Record<string, string> | null;
      }>;
    };

    if (!indicador_id || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "Se requiere indicador_id y un array de datos válido." },
        { status: 400 }
      );
    }

    // Validate each row
    const validRows: Array<{
      indicador_id: string;
      valor: number;
      periodo: string;
      region: string;
      desglose: Record<string, string> | null;
    }> = [];

    for (const row of rows) {
      if (
        typeof row.valor !== "number" ||
        !row.periodo ||
        typeof row.periodo !== "string" ||
        !row.region ||
        typeof row.region !== "string"
      ) {
        continue; // Skip invalid rows
      }

      validRows.push({
        indicador_id,
        valor: row.valor,
        periodo: row.periodo,
        region: row.region,
        desglose: row.desglose || null,
      });
    }

    if (validRows.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron datos válidos para insertar." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Verify the indicator exists
    const { data: indicador, error: indError } = await supabase
      .from("indicadores")
      .select("id, nombre, categoria")
      .eq("id", indicador_id)
      .single();

    if (indError || !indicador) {
      return NextResponse.json(
        { error: "Indicador no encontrado." },
        { status: 404 }
      );
    }

    // Insert data
    const { data, error } = await supabase
      .from("datos_indicadores")
      .insert(validRows)
      .select();

    if (error) {
      return NextResponse.json(
        { error: `Error al insertar datos: ${error.message}` },
        { status: 500 }
      );
    }

    // Record the upload
    await supabase.from("uploads").insert({
      filename: `manual-upload-${new Date().toISOString().split("T")[0]}`,
      categoria: indicador.categoria,
      fuente: indicador.nombre,
      registros_procesados: data?.length ?? 0,
      registros_errores: rows.length - validRows.length,
      estado: "completado",
    });

    return NextResponse.json({
      success: true,
      indicador: indicador.nombre,
      inserted: data?.length ?? 0,
      skipped: rows.length - validRows.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}