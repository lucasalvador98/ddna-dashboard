/**
 * POST /api/admin/backfill
 *
 * Processes ALL unprocessed files in the repositorio table sequentially.
 * Replaces the N8N backfill workflow.
 *
 * Auth: requires INTERNAL_API_SECRET in Authorization header.
 * Rate-limit safe: processes at most 20 files sequentially.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processDocument } from '@/lib/rag/process-document';

// ---------------------------------------------------------------------------
// Admin client factory
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BackfillFileResult {
  fileId: string;
  fileName: string;
  success: boolean;
  totalChunks: number;
  error?: string;
}

interface BackfillSummary {
  total: number;
  processed: number;
  failed: number;
  skipped: number;
  results: BackfillFileResult[];
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: Request): Promise<NextResponse> {
  // Auth check
  const authHeader = request.headers.get('authorization');
  const expectedSecret = process.env.INTERNAL_API_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getAdminClient();

  try {
    // 1. Query ALL unprocessed files (limit 20 for rate-limit safety)
    const { data: unprocessed, error: queryError } = await supabase
      .from('repositorio')
      .select('id, nombre_archivo, processed')
      .eq('processed', false)
      .order('created_at', { ascending: true })
      .limit(20);

    if (queryError) {
      return NextResponse.json(
        { error: `Failed to query repositorio: ${queryError.message}` },
        { status: 500 }
      );
    }

    if (!unprocessed || unprocessed.length === 0) {
      return NextResponse.json({
        summary: {
          total: 0,
          processed: 0,
          failed: 0,
          skipped: 0,
          results: [],
        } satisfies BackfillSummary,
      });
    }

    // 2. Process each file sequentially
    const results: BackfillFileResult[] = [];
    let processedCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    for (const file of unprocessed) {
      const result = await processDocument(supabase, file.id);

      if (result.success) {
        if (result.totalChunks === 0) {
          // Already processed (skipped by processDocument)
          skippedCount++;
          results.push({
            fileId: file.id,
            fileName: file.nombre_archivo,
            success: true,
            totalChunks: 0,
            error: 'Already processed (skipped)',
          });
        } else {
          processedCount++;
          results.push({
            fileId: file.id,
            fileName: file.nombre_archivo,
            success: true,
            totalChunks: result.totalChunks,
          });
        }
      } else {
        failedCount++;
        results.push({
          fileId: file.id,
          fileName: file.nombre_archivo,
          success: false,
          totalChunks: 0,
          error: result.error,
        });
        console.error(`Backfill failed for ${file.nombre_archivo} (${file.id}): ${result.error}`);
      }
    }

    const summary: BackfillSummary = {
      total: unprocessed.length,
      processed: processedCount,
      failed: failedCount,
      skipped: skippedCount,
      results,
    };

    return NextResponse.json({ summary });
  } catch (err) {
    console.error('Backfill route error:', err);
    return NextResponse.json(
      { error: `Backfill failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
