import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize admin client with service role (for internal API only)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(request: Request) {
  // Check for admin secret
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.INTERNAL_API_SECRET;
  
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const categoria = formData.get("categoria") as string || "informes";
  const descripcion = formData.get("descripcion") as string || "";
  const notas = formData.get("notas") as string || "";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const supabase = getAdminClient();
    const fileName = file.name;
    const fileType = fileName.split(".").pop()?.toLowerCase() || "";
    
    // Generate unique file name
    const timestamp = Date.now();
    const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `${categoria}/${timestamp}-${cleanName}`;
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("ddna-repositorio")
      .upload(storagePath, buffer, {
        contentType: getContentType(fileType),
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("ddna-repositorio")
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    // Extract file type
    const tipoDocumento = getTipoDocumento(fileType);

    // Save metadata to database
    const { data: metaData, error: metaError } = await supabase
      .from("repositorio")
      .insert({
        nombre_archivo: fileName,
        descripcion: descripcion,
        categoria: categoria,
        tipo_documento: tipoDocumento,
        tamano_bytes: file.size,
        url_storage: publicUrl,
        notas: notas,
      })
      .select()
      .single();

    if (metaError) {
      console.error("Metadata error:", metaError);
      return NextResponse.json({ error: metaError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      file: metaData,
      url: publicUrl,
    });

  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

function getContentType(ext: string): string {
  const types: Record<string, string> = {
    pdf: "application/pdf",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc: "application/msword",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
  };
  return types[ext] || "application/octet-stream";
}

function getTipoDocumento(ext: string): string {
  const tipos: Record<string, string> = {
    pdf: "pdf",
    xlsx: "xlsx",
    xls: "xlsx",
    docx: "docx",
    doc: "docx",
  };
  return tipos[ext] || "docx";
}