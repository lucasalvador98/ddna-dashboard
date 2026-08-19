import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { checkAdminAuth } from '@/lib/auth-guard';

/**
 * GET    /api/repositorio/file/[id]  — fetch single file metadata
 * PATCH  /api/repositorio/file/[id]  — update descripcion / notas
 * DELETE /api/repositorio/file/[id]  — remove file from storage + DB + chunks
 */

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await checkAdminAuth();
  if (!guard.authorized) return guard.response!;

  try {
    const { id } = await params;
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('repositorio')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await checkAdminAuth();
  if (!guard.authorized) return guard.response!;

  try {
    const { id } = await params;
    const body = (await request.json()) as {
      descripcion?: unknown;
      notas?: unknown;
      categoria?: unknown;
    };

    const updates: Record<string, string> = {};

    if (body.descripcion !== undefined) {
      if (typeof body.descripcion !== 'string') {
        return NextResponse.json({ error: 'descripcion debe ser texto' }, { status: 400 });
      }
      updates.descripcion = body.descripcion.trim();
    }

    if (body.notas !== undefined) {
      if (typeof body.notas !== 'string') {
        return NextResponse.json({ error: 'notas debe ser texto' }, { status: 400 });
      }
      updates.notas = body.notas.trim();
    }

    if (body.categoria !== undefined) {
      const valid = ['encuestas', 'inversion', 'consumos', 'medios', 'proteccion', 'informes'];
      if (typeof body.categoria !== 'string' || !valid.includes(body.categoria)) {
        return NextResponse.json({ error: 'categoria inválida' }, { status: 400 });
      }
      updates.categoria = body.categoria;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No hay campos válidos para actualizar' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('repositorio')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await checkAdminAuth();
  if (!guard.authorized) return guard.response!;

  try {
    const { id } = await params;
    const supabase = getSupabaseAdminClient();

    // 1. Fetch file metadata to know the storage path
    const { data: file, error: fetchError } = await supabase
      .from('repositorio')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
    if (!file) return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });

    // 2. Delete chunks for this file (best-effort)
    const { error: chunksError } = await supabase
      .from('doc_chunks')
      .delete()
      .eq('repo_file_id', id);

    if (chunksError) {
      // Continue — file deletion should not be blocked by chunk cleanup failures
      console.error('Error deleting chunks:', chunksError);
    }

    // 3. Delete from storage (best-effort)
    if (file.url_storage) {
      const path = file.url_storage.split('/storage/v1/object/public/ddna-repositorio/')[1];
      if (path) {
        const { error: storageError } = await supabase.storage
          .from('ddna-repositorio')
          .remove([path]);
        if (storageError) {
          console.error('Error deleting from storage:', storageError);
        }
      }
    }

    // 4. Delete the row
    const { error: deleteError } = await supabase
      .from('repositorio')
      .delete()
      .eq('id', id);

    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 },
    );
  }
}
