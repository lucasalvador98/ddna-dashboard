import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// LLM Configuration (supports OpenAI and Groq)
const LLM_PROVIDER = process.env.LLM_PROVIDER || "groq"; // "openai" or "groq"
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

// System prompt for the DDNA assistant
const SYSTEM_PROMPT = `Eres un asistente especializado de la Defensoría de los Derechos de Niñas, Niños y Adolescentes (DDNA) de la Provincia de Córdoba.

Tu función es ayudar al público en general a obtener información precisa basada en los documentos oficiales de la Defensoría.

Reglas importantes:
1. Responde SIEMPRE en español
2. Basa tus respuestas ÚNICAMENTE en el contexto proporcionado
3. Si la información no está en el contexto, di "No encuentro esa información en los documentos disponibles"
4. Cita las fuentes mencionando el nombre del archivo
5. Mantén un tono profesional pero accesible
6. Si hay datos estadísticos, preséntalos de forma clara (tablas si es necesario)
7. No inventes información`;

export async function POST(request: Request) {
  try {
    const { question, conversationHistory } = await request.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    // Check for LLM API key
    const isGroq = LLM_PROVIDER === "groq";
    const llmApiKey = isGroq ? GROQ_API_KEY : OPENAI_API_KEY;
    
    if (!llmApiKey) {
      return NextResponse.json({ 
        error: `No LLM API key configured. Set ${isGroq ? 'GROQ_API_KEY' : 'OPENAI_API_KEY'} in .env.local` 
      }, { status: 500 });
    }

    // 1. Search for relevant chunks using TEXT SEARCH (NO embeddings)
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get all processed files first
    const { data: processedFiles, error: filesError } = await supabase
      .from('repositorio')
      .select('id')
      .eq('processed', true);

    if (filesError) {
      console.error("Error fetching processed files:", filesError);
    }

    const fileIds = processedFiles?.map(f => f.id) || [];

    // Search in doc_chunks using ILIKE (text search)
    // We'll search for keywords from the question
    const keywords = question
      .toLowerCase()
      .replace(/[?:,;.!¡¿]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)  // Only words longer than 3 chars
      .slice(0, 5);  // Take first 5 keywords

    let relevantChunks: any[] = [];
    
    if (keywords.length > 0) {
      // Build OR condition for keywords
      const searchConditions = keywords.map(kw => `content.ilike.%${kw}%`).join(',');
      
      let query = supabase
        .from('doc_chunks')
        .select(`
          id,
          content,
          chunk_index,
          metadata,
          repositorio!inner (
            nombre_archivo,
            categoria,
            descripcion
          )
        `)
        .limit(10);

      // Filter by processed files if we have them
      if (fileIds.length > 0) {
        query = query.in('repo_file_id', fileIds);
      }

      // Add keyword search
      query = query.or(searchConditions);

      const { data: chunks, error: searchError } = await query;

      if (searchError) {
        console.error("Text search error:", searchError);
      } else {
        relevantChunks = chunks || [];
      }
    }

    // 2. Build context from chunks
    let context = "";
    let sources: any[] = [];

    if (relevantChunks && relevantChunks.length > 0) {
      context = relevantChunks
        .map((chunk: any, idx: number) => {
          const fileName = chunk.repositorio?.nombre_archivo || chunk.metadata?.fileName || "Documento desconocido";
          // Truncate content to ~1000 chars per chunk for context
          const truncatedContent = chunk.content.length > 1000 
            ? chunk.content.substring(0, 1000) + "...[truncado]"
            : chunk.content;
          return `[Fuente ${idx + 1}: ${fileName}]\n${truncatedContent}\n`;
        })
        .join("\n---\n\n");

      sources = relevantChunks.map((chunk: any) => ({
        fileName: chunk.repositorio?.nombre_archivo || chunk.metadata?.fileName,
        categoria: chunk.repositorio?.categoria,
        chunkIndex: chunk.chunk_index,
      }));
    }

    // 3. Build messages array
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(conversationHistory || []).slice(-6), // Last 6 messages for context
      {
        role: "user",
        content: context 
          ? `Contexto disponible de la bibliografía de la DDNA:\n\n${context}\n\nPregunta: ${question}`
          : `No hay documentos procesados en la bibliografía. Pregunta: ${question}`
      }
    ];

    // 4. Call LLM API (OpenAI or Groq)
    const apiUrl = isGroq 
      ? "https://api.groq.com/openai/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";
    // Use currently supported Groq models (updated 2026)
    // See: https://console.groq.com/docs/models
    const groqModel = isGroq ? "llama-3.1-8b-instant" : "gpt-4o-mini"; // llama-3.1-8b is free!
    const model = isGroq ? groqModel : "gpt-4o-mini";  // Updated from decommissioned llama3-8b

    const llmResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${llmApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!llmResponse.ok) {
      const error = await llmResponse.json();
      console.error(`${LLM_PROVIDER} API error:`, error);
      return NextResponse.json({ error: `Failed to generate response from ${LLM_PROVIDER}` }, { status: 500 });
    }

    const llmData = await llmResponse.json();
    const answer = llmData.choices[0]?.message?.content || "No pude generar una respuesta";

    // 5. Return answer + sources
    return NextResponse.json({
      answer,
      sources: sources.length > 0 ? sources : undefined,
      hasContext: context.length > 0,
      totalDocs: fileIds.length,
      searchMethod: "text-search", // Indicate we're using text search, not embeddings
    });

  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
