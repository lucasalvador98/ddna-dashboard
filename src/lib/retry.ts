// Generic retry wrapper with exponential backoff.
// Handles PostgREST cold-start 500s and transient network errors.

export interface RetryOptions {
  /** Max attempts (default: 3) */
  maxAttempts?: number;
  /** Initial delay in ms (default: 800) */
  baseDelayMs?: number;
  /** Which HTTP status codes to retry (default: [502, 503, 504, 429]) */
  retryStatusCodes?: number[];
  /** Additional predicate: return true to retry even on a non-5xx error */
  shouldRetry?: (error: unknown) => boolean;
}

const DEFAULT_RETRY_STATUS = [502, 503, 504, 429];

function isRetryableStatus(err: unknown, codes: number[]): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as Record<string, unknown>;
  // Supabase JS client puts status in `status` or `statusCode`
  const status = (e.status ?? e.statusCode ?? e.code) as number | undefined;
  return typeof status === 'number' && codes.includes(status);
}

function isPostgREST500(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as Record<string, unknown>;
  const msg = (e.message ?? e.error ?? '') as string;
  const status = (e.status ?? e.statusCode) as number | undefined;
  // PostgREST returns 500 during cold start; the message usually contains
  // "Schema cache" or "relation" or just a generic 500 body.
  return status === 500 || /relation .* does not exist/i.test(msg);
}

/**
 * Retry an async operation with exponential backoff.
 * Accepts any function returning a Promise or PromiseLike (e.g. Supabase query builders).
 *
 * @example
 * const data = await retry(() => admin.from('formularios').select('*'));
 */
export async function retry<T>(
  fn: () => Promise<T> | PromiseLike<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelayMs = 800,
    retryStatusCodes = DEFAULT_RETRY_STATUS,
    shouldRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      const retryable =
        isRetryableStatus(err, retryStatusCodes) ||
        isPostgREST500(err) ||
        (shouldRetry?.(err) ?? false);

      if (!retryable || attempt === maxAttempts) {
        throw err;
      }

      // Exponential backoff: 800ms, 1600ms, ...
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}
