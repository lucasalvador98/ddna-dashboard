// Server-only queries for the formularios module.
// Uses the service_role client so admins can read every form (including
// inactive ones, which the anon RLS policy hides). Error strings are Spanish.

import { getSupabaseAdminClient } from '@/lib/supabase';
import type { Formulario } from './types';

export async function listFormularios(): Promise<Formulario[]> {
  try {
    const admin = getSupabaseAdminClient();
    const { data, error } = await admin
      .from('formularios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as Formulario[];
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : 'Error al cargar los formularios.'
    );
  }
}

export async function fetchFormById(id: string): Promise<Formulario | null> {
  try {
    const admin = getSupabaseAdminClient();
    const { data, error } = await admin
      .from('formularios')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (data as Formulario) ?? null;
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : 'Error al cargar el formulario.'
    );
  }
}
