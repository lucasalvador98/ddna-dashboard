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
 * Defaults to a non-reasoning model so tool calling and JSON mode stay cheap
 * and predictable.
 */
export const FALLBACK_MODEL: string | null = (() => {
  const raw = process.env.OPENAI_FALLBACK_MODEL;
  if (raw === 'off') return null;
  return raw || 'gpt-4.1-nano';
})();

/** Timeout for the fallback model. Defaults to 60s. */
export const FALLBACK_TIMEOUT_MS =
  Number(process.env.OPENAI_FALLBACK_TIMEOUT_MS) || 60_000;

/**
 * Reasoning effort for the fallback model when it is a reasoning model.
 * `low` is supported by gpt-5-nano and gpt-6-luna; ignored by non-reasoning
 * models.
 */
export const FALLBACK_REASONING_EFFORT =
  process.env.OPENAI_FALLBACK_REASONING_EFFORT || 'low';

const REASONING_MODEL_PATTERN = /^(gpt-5|gpt-6|o[1-9])/i;

export const CHAT_SUPPORTS_REASONING = REASONING_MODEL_PATTERN.test(CHAT_MODEL);

/**
 * Provider-specific fields for chat completions. Reasoning controls are only
 * added for models that support them, so falling back to gpt-4o-mini or
 * gpt-4.1-nano stays safe.
 */
export function chatProviderBody(
  model: string = CHAT_MODEL,
  reasoningEffort: string = CHAT_REASONING_EFFORT,
): Record<string, unknown> {
  const body: Record<string, unknown> = { ...CHAT_EXTRA_BODY };
  if (REASONING_MODEL_PATTERN.test(model)) {
    body.reasoning_effort = reasoningEffort;
    body.prompt_cache_key = CHAT_PROMPT_CACHE_KEY;
  }
  return body;
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
