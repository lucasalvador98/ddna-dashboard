'use server';

// Admin server actions for the formularios module.
// Every mutation guards with assertAdminAuth() first (enforcement); the admin
// panel LoginGate is the UX gate, the DB RLS policies are defense in depth.
// Error strings are Spanish; identifiers/comments in English.

import { revalidatePath } from 'next/cache';
import { assertAdminAuth } from './assert-admin';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { validateDefinition } from '@/lib/formularios/validation';
import { slugify, isValidSlug } from '@/lib/formularios/slug';
import { buildXlsx } from '@/lib/formularios/xlsx';
import type { DefinicionFormulario, FormularioRespuesta } from '@/lib/formularios/types';

export type ActionResult = { ok: true } | { ok: false; error: string };

export type XlsxExportResult = { ok: true; buffer: ArrayBuffer } | { ok: false; error: string };

export interface FormularioInput {
  titulo: string;
  descripcion: string | null;
  /** Empty string means "auto-derive from titulo". */
  slug: string;
  definicion: unknown;
}

function errorResult(err: unknown, fallback: string): { ok: false; error: string } {
  return { ok: false, error: err instanceof Error ? err.message : fallback };
}

function resolveSlug(input: FormularioInput): string | null {
  const slug = input.slug.trim() || slugify(input.titulo);
  if (!isValidSlug(slug)) {
    return null;
  }
  return slug;
}

async function persistForm(
  mode: 'create' | 'update',
  id: string | undefined,
  input: FormularioInput
): Promise<ActionResult> {
  await assertAdminAuth();

  const definitionValidation = validateDefinition(input.definicion);
  if (!definitionValidation.valid) {
    return { ok: false, error: definitionValidation.errors[0] ?? 'La definición no es válida.' };
  }

  const slug = resolveSlug(input);
  if (!slug) {
    return {
      ok: false,
      error: 'El slug solo puede contener letras minúsculas, números y guiones.',
    };
  }

  try {
    const admin = getSupabaseAdminClient();
    const payload = {
      titulo: input.titulo.trim(),
      descripcion: input.descripcion?.trim() || null,
      slug,
      definicion: input.definicion as DefinicionFormulario,
    };

    const { error } =
      mode === 'create'
        ? await admin.from('formularios').insert(payload)
        : await admin.from('formularios').update(payload).eq('id', id);

    if (error) {
      if (error.code === '23505') {
        return { ok: false, error: 'Ese slug ya existe. Elegí otro nombre.' };
      }
      throw new Error(error.message);
    }
  } catch (err) {
    return errorResult(err, 'Error al guardar el formulario.');
  }

  revalidatePath('/formularios');
  return { ok: true };
}

export async function createForm(input: FormularioInput): Promise<ActionResult> {
  return persistForm('create', undefined, input);
}

export async function updateForm(id: string, input: FormularioInput): Promise<ActionResult> {
  return persistForm('update', id, input);
}

export async function deleteForm(id: string): Promise<ActionResult> {
  await assertAdminAuth();

  try {
    const admin = getSupabaseAdminClient();
    const { error } = await admin.from('formularios').delete().eq('id', id);
    if (error) throw new Error(error.message);
  } catch (err) {
    return errorResult(err, 'Error al eliminar el formulario.');
  }

  revalidatePath('/formularios');
  return { ok: true };
}

export async function deleteRespuesta(id: string): Promise<ActionResult> {
  await assertAdminAuth();

  try {
    const admin = getSupabaseAdminClient();
    const { error } = await admin.from('respuestas_formulario').delete().eq('id', id);
    if (error) throw new Error(error.message);
  } catch (err) {
    return errorResult(err, 'Error al eliminar la respuesta.');
  }

  revalidatePath('/formularios');
  return { ok: true };
}

// Exports the newest responses (same 100 cap as the admin list) as an XLSX
// buffer built by the pure buildXlsx helper; the client downloads it as a Blob.
export async function exportRespuestasXlsx(formularioId: string): Promise<XlsxExportResult> {
  await assertAdminAuth();

  try {
    const admin = getSupabaseAdminClient();
    const { data: formData, error: formError } = await admin
      .from('formularios')
      .select('definicion')
      .eq('id', formularioId)
      .maybeSingle();

    if (formError) throw new Error(formError.message);
    if (!formData) return { ok: false, error: 'El formulario no existe.' };

    const { data: respuestasData, error: respuestasError } = await admin
      .from('respuestas_formulario')
      .select('*')
      .eq('formulario_id', formularioId)
      .order('submitted_at', { ascending: false })
      .limit(100);

    if (respuestasError) throw new Error(respuestasError.message);

    const buffer = buildXlsx(
      formData.definicion as DefinicionFormulario,
      (respuestasData ?? []) as FormularioRespuesta[]
    );
    return { ok: true, buffer };
  } catch (err) {
    return errorResult(err, 'Error al exportar las respuestas.');
  }
}

export async function toggleForm(id: string): Promise<ActionResult> {
  await assertAdminAuth();

  try {
    const admin = getSupabaseAdminClient();
    const { data: current, error: fetchError } = await admin
      .from('formularios')
      .select('activo')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw new Error(fetchError.message);
    if (!current) return { ok: false, error: 'El formulario no existe.' };

    const { error } = await admin
      .from('formularios')
      .update({ activo: !current.activo })
      .eq('id', id);
    if (error) throw new Error(error.message);
  } catch (err) {
    return errorResult(err, 'Error al cambiar el estado del formulario.');
  }

  revalidatePath('/formularios');
  return { ok: true };
}
