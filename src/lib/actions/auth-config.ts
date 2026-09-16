'use server';

import { getSupabaseAdminClient } from '@/lib/supabase';
import { retry } from '@/lib/retry';

export async function getAuthConfig() {
  const adminClient = getSupabaseAdminClient();
  const { data, error } = await retry(() =>
    adminClient
      .from('settings')
      .select('value')
      .eq('key', 'auth')
      .single()
  );

  if (error) {
    throw new Error(error.message);
  }

  return { data };
}
