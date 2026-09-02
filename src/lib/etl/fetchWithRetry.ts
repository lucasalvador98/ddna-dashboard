export interface FetchRetryOptions {
  retries?: number;
  backoffMs?: number[];
  timeoutMs?: number;
}

const DEFAULT_BACKOFF = [1000, 2000, 4000];
const DEFAULT_TIMEOUT = 10000;

export async function fetchWithRetry(
  url: string,
  options: FetchRetryOptions = {},
  fetchOptions: RequestInit = {}
): Promise<Response> {
  const retries = options.retries ?? 3;
  const backoff = options.backoffMs ?? DEFAULT_BACKOFF;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timeout);

      if (res.ok) return res;

      // Retry on 5xx and 429, not on 4xx (except 429)
      const retryable = res.status >= 500 || res.status === 429;
      if (!retryable || attempt === retries) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }

      lastError = new Error(`HTTP ${res.status} for ${url}`);
    } catch (err) {
      clearTimeout(timeout);
      lastError = err instanceof Error ? err : new Error(String(err));

      const isAbort = lastError.name === 'AbortError';
      if (isAbort) {
        lastError = new Error(`Timeout ${timeoutMs}ms for ${url}`);
      }

      // Don't retry on 4xx (except 429) — those are client errors
      const m = lastError.message.match(/^HTTP (\d+)/);
      if (m) {
        const code = Number(m[1]);
        const retryable = code >= 500 || code === 429;
        if (!retryable) break;
      }

      if (attempt === retries) break;
    }

    // Backoff before next attempt
    const delay = backoff[attempt] ?? backoff[backoff.length - 1];
    await new Promise((r) => setTimeout(r, delay));
  }

  throw lastError ?? new Error(`fetchWithRetry failed for ${url}`);
}

export async function fetchJsonWithRetry<T = unknown>(
  url: string,
  options?: FetchRetryOptions
): Promise<T> {
  const res = await fetchWithRetry(url, options);
  return (await res.json()) as T;
}
