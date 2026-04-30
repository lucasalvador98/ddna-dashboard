import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { StorageClient } from "@supabase/storage-js";
import { chunkText } from "@/lib/rag/chunker";
import { generateEmbedding } from "@/lib/rag/embedder";
import { extractTextFromPDF } from "@/lib/rag/extractors/pdf";
import { extractTextFromDOCX } from "@/lib/rag/extractors/docx";
import { extractTextFromXLSX } from "@/lib/rag/extractors/xlsx";

// Initialize Supabase admin client
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

// Initialize Storage client
function getStorageClient() {
  return new StorageClient(
    `${supabaseUrl}/storage/v1`,
    {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    {}
  );
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.INTERNAL_API_SECRET;
  
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: "fileId is required" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const storage = getStorageClient();

    // 1. Get file metadata from repositorio table
    const { data: fileData, error: fileError } = await supabase
      .from("repositorio")
      .select("*")
      .eq("id", fileId)
      .single();

    if (fileError || !fileData) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Check if already processed
    if (fileData.processed) {
      return NextResponse.json({
        message: "File already processed",
        totalChunks: fileData.total_chunks,
      });
    }

    // 2. Download file from Storage
    const filePath = fileData.url_storage?.split("/storage/v1/object/public/ddna-repositorio/")[1];
    
    if (!filePath) {
      return NextResponse.json({ error: "Invalid storage URL" }, { status: 400 });
    }

    const { data: fileData2, error: downloadError } = await storage
      .from("ddna-repositorio")
      .download(filePath);

    if (downloadError || !fileData2) {
      console.error("Download error:", downloadError);
      return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
    }

    // Convert to buffer
    const arrayBuffer = await fileData2.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Extract text based on file type
    let extractedText = "";
    
    const fileType = fileData.tipo_documento?.toLowerCase();
    
    try {
      if (fileType === "pdf") {
        const result = await extractTextFromPDF(buffer);
        extractedText = result.text;
      } else if (fileType === "docx" || fileType === "doc") {
        const result = await extractTextFromDOCX(buffer);
        extractedText = result.text;
      } else if (fileType === "xlsx" || fileType === "xls") {
        const result = await extractTextFromXLSX(buffer);
        extractedText = result.text;
      } else {
        return NextResponse.json({ error: `Unsupported file type: ${fileType}` }, { status: 400 });
      }
    } catch (extractError) {
      console.error("Extraction error:", extractError);
      return NextResponse.json({ error: `Failed to extract text: ${extractError}` }, { status: 500 });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json({ error: "No text extracted from file" }, { status: 400 });
    }

    // 4. Chunk the text
    const chunks = chunkText(extractedText, {
      chunkSize: 2000,
      overlap: 200,
      minChunkSize: 100,
    });

    if (chunks.length === 0) {
      return NextResponse.json({ error: "No chunks generated" }, { status: 400 });
    }

    // 5. Generate embeddings (batch)
    const texts = chunks.map((c) => c.content);
    
    let embeddings: number[][] = [];
    try {
      embeddings = await generateEmbeddingsBatch(texts);
    } catch (embedError) {
      console.error("Embedding error:", embedError);
      return NextResponse.json({ error: `Failed to generate embeddings: ${embedError}` }, { status: 500 });
    }

    // 6. Store chunks in doc_chunks table
    const chunksToInsert = chunks.map((chunk, index) => ({
      repo_file_id: fileId,
      chunk_index: chunk.index,
      content: chunk.content,
      embedding: embeddings[index] || null,
      metadata: {
        ...chunk.metadata,
        fileType,
        fileName: fileData.nombre_archivo,
      },
    }));

    const { error: insertError } = await supabase
      .from("doc_chunks")
      .insert(chunksToInsert);

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json({ error: `Failed to store chunks: ${insertError.message}` }, { status: 500 });
    }

    // 7. Update repositorio table
    const { error: updateError } = await supabase
      .from("repositorio")
      .update({
        processed: true,
        total_chunks: chunks.length,
        last_processed_at: new Date().toISOString(),
      })
      .eq("id", fileId);

    if (updateError) {
      console.error("Update error:", updateError);
    }

    return NextResponse.json({
      success: true,
      totalChunks: chunks.length,
      fileType,
      textLength: extractedText.length,
    });

  } catch (err) {
    console.error("Process error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
