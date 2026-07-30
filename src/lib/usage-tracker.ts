/**
 * AI Usage Tracker — logs LLM token usage to Supabase.
 */

// Cost per 1M tokens in USD (approximate, based on gpt-4o-mini pricing)
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gpt-4o': { input: 2.50, output: 10.00 },
  'text-embedding-3-small': { input: 0.02, output: 0 },
};

const DEFAULT_COST = { input: 0.15, output: 0.60 };

interface UsageData {
  tool: 'chat' | 'informe-ejecutivo' | 'presentacion' | 'embeddings';
  model: string;
  promptTokens: number;
  completionTokens: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

export function estimateCost(model: string, promptTokens: number, completionTokens: number): number {
  const costs = MODEL_COSTS[model] || DEFAULT_COST;
  const inputCost = (promptTokens / 1_000_000) * costs.input;
  const outputCost = (completionTokens / 1_000_000) * costs.output;
  return Number((inputCost + outputCost).toFixed(6));
}

/**
 * Log LLM usage to Supabase. Fire-and-forget — never throws.
 */
export async function trackLLMUsage(data: UsageData): Promise<void> {
  try {
    const totalTokens = data.promptTokens + data.completionTokens;
    const costEstimate = estimateCost(data.model, data.promptTokens, data.completionTokens);

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    await supabase.from('ai_usage_logs').insert({
      tool: data.tool,
      model: data.model,
      prompt_tokens: data.promptTokens,
      completion_tokens: data.completionTokens,
      total_tokens: totalTokens,
      cost_estimate: costEstimate,
      error: data.error || null,
      metadata: data.metadata || {},
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[AI Usage] ${data.tool} | ${data.model} | prompt: ${data.promptTokens} | completion: ${data.completionTokens} | total: ${totalTokens} | cost: $${costEstimate}`
      );
    }
  } catch {
    // Silently fail — usage tracking should never break the app
  }
}
