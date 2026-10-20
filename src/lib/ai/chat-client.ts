/**
 * OpenAI-compatible chat completion client with retry + model fallback.
 *
 * Retries the primary model on 429/5xx/network errors, then falls back to a
 * secondary model when the primary is still unavailable. Timeouts go straight
 * to the fallback: retrying a 120s timeout would keep the request alive for
 * too long. Auth/config errors (400/401/403/404) are never retried.
 */

import { CHAT_API_KEY, chatCompletionsUrl } from '@/lib/ai-config';

/** Error that is safe to retry with the fallback model. */
export class FallbackEligibleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FallbackEligibleError';
  }
}

export interface ChatCompletionRequest {
  /** Model tried first. */
  primaryModel: string;
  /** Model tried once the primary is exhausted. Set to null to disable. */
  fallbackModel: string | null;
  /** Builds the request body for a given model (reasoning fields vary). */
  buildBody: (model: string) => Record<string, unknown>;
  /** Timeout for the primary model. */
  timeoutMs: number;
  /** Timeout for the fallback model. Defaults to timeoutMs. */
  fallbackTimeoutMs?: number;
  /** Attempts per model. Defaults to 3. */
  maxRetries?: number;
}

export interface ChatCompletionResponse {
  /** Successful HTTP response from the model that answered. */
  response: Response;
  /** Model that actually produced the response. */
  modelUsed: string;
}

function isTimeoutError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return (
    err.name === 'TimeoutError' ||
    err.name === 'AbortError' ||
    /timed out|timeout|aborted/i.test(err.message)
  );
}

function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError) return true;
  return (
    err instanceof Error &&
    /fetch failed|network|ECONN|ENOTFOUND|EAI_AGAIN|socket hang up/i.test(err.message)
  );
}

async function readErrorMessage(response: Response): Promise<string> {
  const text = await response.text().catch(() => '');
  if (!text) return `HTTP ${response.status}`;
  try {
    const parsed = JSON.parse(text) as { error?: { message?: string } };
    return parsed?.error?.message || text.substring(0, 300);
  } catch {
    return text.substring(0, 300);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchChatCompletion(
  request: ChatCompletionRequest,
): Promise<ChatCompletionResponse> {
  const {
    primaryModel,
    fallbackModel,
    buildBody,
    timeoutMs,
    fallbackTimeoutMs = timeoutMs,
    maxRetries = 3,
  } = request;

  const attempt = async (model: string, timeout: number): Promise<Response> => {
    // Built outside the retry try/catch so a builder bug is not mistaken for a
    // transient network failure.
    const body = JSON.stringify(buildBody(model));
    let lastError: Error | null = null;

    for (let attemptNumber = 0; attemptNumber < maxRetries; attemptNumber++) {
      if (attemptNumber > 0) {
        await delay(Math.pow(2, attemptNumber + 1) * 1000 - 1000);
      }

      try {
        const response = await fetch(chatCompletionsUrl(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${CHAT_API_KEY}`,
          },
          body,
          signal: AbortSignal.timeout(timeout),
        });

        if (response.ok) return response;

        const message = await readErrorMessage(response);
        if (response.status === 429 || response.status >= 500) {
          lastError = new FallbackEligibleError(
            `Error de OpenAI (${response.status}): ${message}`,
          );
          console.warn(
            `[ai] ${model} intento ${attemptNumber + 1}/${maxRetries}: ${message}`,
          );
          continue;
        }

        throw new Error(`Error de OpenAI (${response.status}): ${message}`);
      } catch (err) {
        if (isTimeoutError(err)) {
          throw new FallbackEligibleError(
            `Timeout de OpenAI (${timeout}ms) con ${model}`,
          );
        }
        if (isNetworkError(err)) {
          lastError = err instanceof Error ? err : new Error(String(err));
          console.warn(
            `[ai] ${model} intento ${attemptNumber + 1}/${maxRetries}: error de red`,
          );
          continue;
        }
        throw err;
      }
    }

    throw lastError ?? new FallbackEligibleError(
      `Máximo de reintentos alcanzado con ${model}`,
    );
  };

  try {
    const response = await attempt(primaryModel, timeoutMs);
    return { response, modelUsed: primaryModel };
  } catch (err) {
    const canFallback =
      fallbackModel !== null &&
      fallbackModel !== primaryModel &&
      (err instanceof FallbackEligibleError || isNetworkError(err));

    if (!canFallback) throw err;

    console.warn(`[ai] Fallback de ${primaryModel} a ${fallbackModel}`);
    const response = await attempt(fallbackModel, fallbackTimeoutMs);
    return { response, modelUsed: fallbackModel };
  }
}
