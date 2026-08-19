'use server';

import { getSupabaseAdminClient } from '@/lib/supabase';

export async function getAuthConfig() {
  const adminClient = getSupabaseAdminClient();
  const { data, error } = await adminClient
    .from('settings')
    .select('value')
    .eq('key', 'auth')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { data };
}
