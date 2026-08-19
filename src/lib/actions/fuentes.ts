'use server';

import { createClient } from '@supabase/supabase-js';
import type { CategoriaIndicador } from '@/lib/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function getFuentes(categoria?: CategoriaIndicador) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase not configured');
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  let query = supabase
    .from('fuentes_datos')
    .select('*')
    .order('nombre', { ascending: true });

  if (categoria) {
    query = query.eq('categoria', categoria);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return { data };
}
