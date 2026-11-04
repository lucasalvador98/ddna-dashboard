/**
 * processDocument — End-to-end document processing pipeline
 *
 * Downloads a file from Supabase Storage, extracts text, chunks it,
 * generates embeddings, and stores everything in doc_chunks.
 *
 * Replaces the N8N workflow that previously handled this.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { chunkText } from './chunker';
import { generateEmbeddingsBatch } from './embedder';
import { extractTextFromPDF } from './extractors/pdf';
import { extractTextFromDOCX } from './extractors/docx';
import { extractTextFromXLSX } from './extractors/xlsx';
import { EMBEDDING_API_KEY } from '@/lib/ai-config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProcessDocumentResult {
  success: boolean;
  totalChunks: number;
  textLength: number;
  error?: string;
}

interface RepositorioRow {
  id: string;
  nombre_archivo: string;
  tipo_documento: string;
  url_storage: string | null;
  processed: boolean;
  categoria: string;
}

interface ExtractResult {
  text: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse the Storage file path from a public URL.
 *
 * Example input:
 *   https://ppyyqrvirjqmfpqaqnxy.supabase.co/storage/v1/object/public/ddna-repositorio/informes/123-file.pdf
 * Output:
 *   informes/123-file.pdf
 */
function parseStoragePath(url: string): string | null {
  const match = url.match(/\/ddna-repositorio\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Dispatch to the correct extractor based on file type.
 */
async function extractText(tipoDocumento: string, buffer: Buffer): Promise<ExtractResult> {
  const normalized = tipoDocumento.toLowerCase();

  if (normalized === 'pdf') {
    return extractTextFromPDF(buffer);
  }

  if (normalized === 'docx' || normalized === 'doc') {
    return extractTextFromDOCX(buffer);
  }

  if (normalized === 'xlsx' || normalized === 'xls') {
    return extractTextFromXLSX(buffer);
  }

  throw new Error(`Unsupported file type: ${tipoDocumento}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/**
 * Process a single document end-to-end:
 *   1. Query repositorio by ID
 *   2. Skip if already processed
 *   3. Download from Storage
 *   4. Extract text
 *   5. Chunk
 *   6. Generate embeddings (graceful fallback if unavailable)
 *   7. Insert chunks into doc_chunks
 *   8. Update repositorio metadata
 */
export async function processDocument(
  supabase: SupabaseClient,
  fileId: string
): Promise<ProcessDocumentResult> {
  // 1. Query repositorio by ID
  const { data: fileRow, error: queryError } = await supabase
    .from('repositorio')
    .select('*')
    .eq('id', fileId)
    .single();

  if (queryError || !fileRow) {
    return {
      success: false,
      totalChunks: 0,
      textLength: 0,
      error: `File not found in repositorio: ${queryError?.message ?? 'no rows returned'}`,
    };
  }

  const file = fileRow as RepositorioRow;

  // 2. Skip if already processed
  if (file.processed) {
    return { success: true, totalChunks: 0, textLength: 0 };
  }

  // 3. Parse file path from url_storage
  if (!file.url_storage) {
    return {
      success: false,
      totalChunks: 0,
      textLength: 0,
      error: 'url_storage is empty — cannot determine file path',
    };
  }

  const storagePath = parseStoragePath(file.url_storage);
  if (!storagePath) {
    return {
      success: false,
      totalChunks: 0,
      textLength: 0,
      error: `Could not parse storage path from url_storage: ${file.url_storage}`,
    };
  }

  // 4. Download from Storage (uses admin client for access)
  const { data: blob, error: downloadError } = await supabase.storage
    .from('ddna-repositorio')
    .download(storagePath);

  if (downloadError || !blob) {
    return {
      success: false,
      totalChunks: 0,
      textLength: 0,
      error: `Download failed: ${downloadError?.message ?? 'no data returned'}`,
    };
  }

  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 5. Extract text
  let extractedText: string;
  try {
    const result = await extractText(file.tipo_documento, buffer);
    extractedText = result.text;
  } catch (extractErr) {
    return {
      success: false,
      totalChunks: 0,
      textLength: 0,
      error: `Text extraction failed: ${extractErr instanceof Error ? extractErr.message : String(extractErr)}`,
    };
  }

  if (!extractedText || extractedText.trim().length === 0) {
    return {
      success: false,
      totalChunks: 0,
      textLength: 0,
      error: 'No text extracted from file (empty content)',
    };
  }

  // 6. Chunk
  const chunks = chunkText(extractedText, {
    chunkSize: 2000,
    overlap: 200,
    minChunkSize: 100,
  });

  if (chunks.length === 0) {
    return {
      success: false,
      totalChunks: 0,
      textLength: extractedText.length,
      error: 'Chunker produced zero chunks',
    };
  }

  // 7. Generate embeddings
  //
  // Embeddings are optional per deployment but not optional per run:
  // - Key absent: text-only deployment. Chunks are stored without embeddings
  //   and the document is still marked processed, because that is a deliberate
  //   configuration, not a transient failure. See step 9.
  // - Key present: any missing embedding means the provider failed. Marking the
  //   document processed would make the failure permanent: processDocument
  //   skips processed rows and search_doc_chunks only returns rows with
  //   `embedding IS NOT NULL`, so the document could never be retried or found.
  const embeddingsConfigured = Boolean(EMBEDDING_API_KEY);
  const texts = chunks.map(c => c.content);
  let embeddings: number[][] | null = null;

  if (embeddingsConfigured) {
    try {
      embeddings = await generateEmbeddingsBatch(texts);
    } catch (embedErr) {
      console.warn(
        'Embedding generation failed:',
        embedErr instanceof Error ? embedErr.message : String(embedErr)
      );
    }
  }

  if (embeddingsConfigured && chunks.some((_, i) => !embeddings?.[i])) {
    const embeddedCount = embeddings ? embeddings.filter(Boolean).length : 0;
    return {
      success: false,
      totalChunks: 0,
      textLength: extractedText.length,
      error: `Embedding generation incomplete (${embeddedCount}/${chunks.length} chunks embedded). Document left unprocessed so it can be retried.`,
    };
  }

  // 8. Insert chunks into doc_chunks
  const chunksToInsert = chunks.map((chunk, i) => ({
    repo_file_id: fileId,
    chunk_index: chunk.index,
    content: chunk.content,
    embedding: embeddings ? embeddings[i] : null,
    metadata: {
      ...chunk.metadata,
      fileType: file.tipo_documento,
      fileName: file.nombre_archivo,
      categoria: file.categoria,
    },
  }));

  const { error: insertError } = await supabase.from('doc_chunks').insert(chunksToInsert);

  if (insertError) {
    return {
      success: false,
      totalChunks: 0,
      textLength: extractedText.length,
      error: `Failed to insert chunks: ${insertError.message}`,
    };
  }

  // 9. Update repositorio
  const { error: updateError } = await supabase
    .from('repositorio')
    .update({
      processed: true,
      total_chunks: chunks.length,
      last_processed_at: new Date().toISOString(),
    })
    .eq('id', fileId);

  if (updateError) {
    console.error('Failed to update repositorio after processing:', updateError.message);
    // Chunks are stored but the row is not marked processed. Do not report
    // success: a caller that trusts `success` would never retry the run.
    return {
      success: false,
      totalChunks: chunks.length,
      textLength: extractedText.length,
      error: `Failed to update repositorio (total_chunks/processed): ${updateError.message}`,
    };
  }

  return {
    success: true,
    totalChunks: chunks.length,
    textLength: extractedText.length,
  };
}
