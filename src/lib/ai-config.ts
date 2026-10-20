/**
 * Central AI configuration.
 *
 * All model identifiers and endpoints are configurable via environment
 * variables so the app can point at any OpenAI-compatible provider
 * (OpenAI, OpenRouter, Groq, DeepSeek, etc.).
 *
 * NOTE: changing OPENAI_EMBEDDING_MODEL invalidates existing vectors.
 * Every chunk in `doc_chunks` must be re-embedded with the new model,
 * and the `vector(n)` column dimension must match the new output size.
 */

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

/** Base URL of the OpenAI-compatible API, including the version path. */
export const OPENAI_BASE_URL = (
  process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
).replace(/\/+$/, '');

/** Chat model used by chat, executive report and presentation generation. */
export const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';

/** Embedding model used to index and query the document knowledge base. */
export const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

export const CHAT_TIMEOUT_MS = Number(process.env.OPENAI_CHAT_TIMEOUT_MS) || 120_000;

export const EMBEDDING_TIMEOUT_MS = Number(process.env.OPENAI_EMBEDDING_TIMEOUT_MS) || 30_000;

export function chatCompletionsUrl(): string {
  return `${OPENAI_BASE_URL}/chat/completions`;
}

export function embeddingsUrl(): string {
  return `${OPENAI_BASE_URL}/embeddings`;
}
