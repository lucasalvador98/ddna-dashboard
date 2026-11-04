/**
 * Central AI configuration.
 *
 * Chat and embeddings may point at different OpenAI-compatible providers,
 * each with its own endpoint and API key. All values are read at runtime.
 *
 * Example — chat on DeepSeek, embeddings on OpenAI:
 *   OPENAI_CHAT_BASE_URL=https://api.deepseek.com
 *   OPENAI_CHAT_MODEL=deepseek-flash
 *   OPENAI_CHAT_API_KEY=sk-...
 *   OPENAI_EMBEDDING_BASE_URL=https://api.openai.com/v1
 *   OPENAI_EMBEDDING_MODEL=text-embedding-3-small
 *   OPENAI_EMBEDDING_API_KEY=sk-...
 *
 * NOTE: changing OPENAI_EMBEDDING_MODEL or OPENAI_EMBEDDING_DIMENSIONS
 * invalidates every stored vector. Re-embed all `doc_chunks` rows and make
 * the `vector(n)` column dimension match the new output size.
 */

function trimTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, '');
}

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';

/** Legacy single-provider override, kept for backwards compatibility. */
const LEGACY_BASE_URL = process.env.OPENAI_BASE_URL
  ? trimTrailingSlashes(process.env.OPENAI_BASE_URL)
  : null;

export const CHAT_BASE_URL = trimTrailingSlashes(
  process.env.OPENAI_CHAT_BASE_URL || LEGACY_BASE_URL || DEFAULT_BASE_URL,
);

export const EMBEDDING_BASE_URL = trimTrailingSlashes(
  process.env.OPENAI_EMBEDDING_BASE_URL || LEGACY_BASE_URL || DEFAULT_BASE_URL,
);

export const CHAT_API_KEY =
  process.env.OPENAI_CHAT_API_KEY || process.env.OPENAI_API_KEY || '';

export const EMBEDDING_API_KEY =
  process.env.OPENAI_EMBEDDING_API_KEY || process.env.OPENAI_API_KEY || '';

/** Chat model used by chat, executive report and presentation generation. */
export const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-6-luna';

/** Embedding model used to index and query the document knowledge base. */
export const EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

/**
 * Optional output dimensionality for Matryoshka embedding models
 * (text-embedding-3-*, gemini-embedding-*). Omitted when unset.
 */
export const EMBEDDING_DIMENSIONS = (() => {
  const raw = process.env.OPENAI_EMBEDDING_DIMENSIONS;
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
})();

/**
 * Optional provider-specific fields merged into every chat completion body.
 *
 * Example — DeepSeek enables thinking mode by default, which is slow for chat:
 *   OPENAI_CHAT_EXTRA_BODY={"thinking":{"type":"disabled"}}
 */
export const CHAT_EXTRA_BODY: Record<string, unknown> = (() => {
  const raw = process.env.OPENAI_CHAT_EXTRA_BODY;
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
})();

/**
 * Reasoning effort for GPT-5+/GPT-6/o-series models. `none` keeps latency and
 * output cost low while preserving tool calling.
 * Supported values depend on the model:
 *   gpt-6-luna → none | low | medium | high | xhigh
 *   gpt-5-nano → minimal | low | medium | high
 */
export const CHAT_REASONING_EFFORT =
  process.env.OPENAI_CHAT_REASONING_EFFORT || 'none';

/** Prompt-cache routing hint for models that support it (GPT-5+). */
export const CHAT_PROMPT_CACHE_KEY =
  process.env.OPENAI_CHAT_PROMPT_CACHE_KEY || 'ddna-repositorio-chat';

/**
 * Secondary chat model used when the primary exhausts retries on 429/5xx,
 * timeouts or network errors. Set `OPENAI_FALLBACK_MODEL=off` to disable.
 *
 * Must be a model that still exists. The previous default, `gpt-4.1-nano`, was
 * shut down by OpenAI on 2026-10-23, so every fallback attempt ended in a
 * model-not-found error and the whole retry path was dead. `gpt-5.6-luna` is
 * the vendor's replacement for that model and supports function calling and
 * structured outputs.
 */
export const FALLBACK_MODEL: string | null = (() => {
  const raw = process.env.OPENAI_FALLBACK_MODEL;
  if (raw === 'off') return null;
  return raw || 'gpt-5.6-luna';
})();

/** Timeout for the fallback model. Defaults to 60s. */
export const FALLBACK_TIMEOUT_MS =
  Number(process.env.OPENAI_FALLBACK_TIMEOUT_MS) || 60_000;

/**
 * Reasoning effort for the fallback model when it is a reasoning model,
 * ignored by non-reasoning models.
 *
 * Defaults to `none` so the fallback mirrors the primary's operating mode:
 * Chat Completions only exposes function calling and sampling parameters when
 * reasoning is disabled, and the fallback exists precisely to keep tool-using
 * requests alive. A higher effort here would silently drop the tools the
 * request was built around.
 */
export const FALLBACK_REASONING_EFFORT =
  process.env.OPENAI_FALLBACK_REASONING_EFFORT || 'none';

const REASONING_MODEL_PATTERN = /^(gpt-5|gpt-6|o[1-9])/i;

export const CHAT_SUPPORTS_REASONING = REASONING_MODEL_PATTERN.test(CHAT_MODEL);

/**
 * Provider-specific fields for chat completions. Reasoning controls are only
 * added for models that support them, so a non-reasoning fallback stays safe.
 *
 * Sampling parameters (temperature, top_p, logprobs) are only accepted by
 * reasoning models when reasoning effort is `none`: "When reasoning effort is
 * not none, remove temperature, top_p, and top_logprobs".
 *
 * That makes a hardcoded temperature unsafe — a config change to
 * OPENAI_CHAT_REASONING_EFFORT would turn every request into a 400, and
 * fetchChatCompletion never retries a 400, so the fallback could not rescue it.
 * Route temperature through here instead of adding it to the request body
 * directly.
 */
export function chatProviderBody(
  model: string = CHAT_MODEL,
  reasoningEffort?: string,
  temperature?: number,
): Record<string, unknown> {
  const body: Record<string, unknown> = { ...CHAT_EXTRA_BODY };
  const isReasoning = REASONING_MODEL_PATTERN.test(model);
  const effort = reasoningEffort ?? CHAT_REASONING_EFFORT;

  if (isReasoning) {
    body.reasoning_effort = effort;
    body.prompt_cache_key = CHAT_PROMPT_CACHE_KEY;
  }

  const samplingAllowed = !isReasoning || effort === 'none';

  if (temperature !== undefined && samplingAllowed) {
    body.temperature = temperature;
  }

  if (!samplingAllowed) {
    // A sampling parameter smuggled in through OPENAI_CHAT_EXTRA_BODY would
    // recreate the same 400 this guard exists to prevent.
    delete body.temperature;
    delete body.top_p;
  }

  return body;
}

/**
 * Field name for the output-token cap, which is not portable.
 *
 * Reasoning models require the OpenAI-specific `max_completion_tokens`: the
 * reference states `max_tokens` is "not compatible with o-series models".
 * OpenAI-compatible providers (DeepSeek, Gemini, OpenRouter, Groq) document
 * `max_tokens` and have no obligation to honour the OpenAI name, so sending it
 * to them either fails the request or silently drops the cap — which is how a
 * 16,000-token presentation budget becomes the provider's 8,192 default.
 *
 * Keyed off the model rather than the base URL: a proxy in front of OpenAI
 * still speaks the OpenAI contract.
 */
export function chatOutputTokenField(
  model: string = CHAT_MODEL,
): 'max_completion_tokens' | 'max_tokens' {
  return REASONING_MODEL_PATTERN.test(model) ? 'max_completion_tokens' : 'max_tokens';
}

export const CHAT_TIMEOUT_MS =
  Number(process.env.OPENAI_CHAT_TIMEOUT_MS) || 120_000;

export const EMBEDDING_TIMEOUT_MS =
  Number(process.env.OPENAI_EMBEDDING_TIMEOUT_MS) || 30_000;

export function chatCompletionsUrl(): string {
  return `${CHAT_BASE_URL}/chat/completions`;
}

export function embeddingsUrl(): string {
  return `${EMBEDDING_BASE_URL}/embeddings`;
}
