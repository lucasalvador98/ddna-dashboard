'use server';

import { getSupabaseAdminClient } from '@/lib/supabase';

export interface AiUsageLog {
  id: number;
  tool: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_estimate: number;
  error: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export async function getUsageStats(days: number = 7): Promise<AiUsageLog[]> {
  const supabase = getSupabaseAdminClient();

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from('ai_usage_logs')
    .select('*')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) throw new Error(error.message);
  return data as AiUsageLog[];
}
