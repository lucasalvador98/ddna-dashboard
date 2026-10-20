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
export const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';

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
