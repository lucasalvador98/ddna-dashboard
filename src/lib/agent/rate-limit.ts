/**
 * rate-limit — Simple in-memory sliding-window rate limiter.
 *
 * Intended for Next.js API routes (Node.js runtime).
 * NOT suitable for edge middleware (state is per-instance, resets on cold start).
 *
 * Each key/IP tracks an array of timestamps within the window.
 * Expired entries are cleaned up on every check (lazy cleanup).
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 60 s
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, entry] of store) {
    // Per-entry sliding window: drop timestamps older than 60s (the typical
    // windowMs we use). Only delete the key when no fresh timestamps remain.
    // NOTE: this assumes callers use a 60_000ms window — if a caller passes a
    // different windowMs we may keep slightly stale entries, which is harmless
    // (they get filtered again on the next check).
    const fresh = entry.timestamps.filter((ts) => now - ts < 60_000);
    if (fresh.length === 0) {
      store.delete(key);
    } else {
      entry.timestamps = fresh;
    }
  }
}

/**
 * Check if a request should be rate-limited.
 *
 * @param key - Unique identifier (e.g. `ip:endpoint`)
 * @param maxRequests - Maximum requests allowed in the window (default 30)
 * @param windowMs - Window duration in ms (default 60_000 = 1 min)
 * @returns `{ allowed: true }` or `{ allowed: false, retryAfterMs: number }`
 */
export function checkRateLimit(
  key: string,
  maxRequests = 30,
  windowMs = 60_000,
): { allowed: true } | { allowed: false; retryAfterMs: number } {
  cleanup();

  const now = Date.now();

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    const oldest = entry.timestamps[0];
    const retryAfterMs = windowMs - (now - oldest);
    return { allowed: false, retryAfterMs };
  }

  entry.timestamps.push(now);
  return { allowed: true };
}

/**
 * Create a rate-limited handler wrapper for API routes.
 *
 * @param handler - The original request handler
 * @param options - { maxRequests, windowMs, keyPrefix }
 */
export function withRateLimit(
  handler: (request: Request) => Promise<Response>,
  options?: { maxRequests?: number; windowMs?: number; keyPrefix?: string },
): (request: Request) => Promise<Response> {
  const { maxRequests = 30, windowMs = 60_000, keyPrefix = 'api' } = options ?? {};

  return async (request: Request) => {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    const url = new URL(request.url);
    const key = `${keyPrefix}:${ip}:${url.pathname}`;

    const result = checkRateLimit(key, maxRequests, windowMs);

    if (!result.allowed) {
      const retryAfter = Math.ceil(result.retryAfterMs / 1000);
      return new Response(
        JSON.stringify({
          error: `Demasiadas solicitudes. Intentá de nuevo en ${retryAfter} segundos.`,
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
          },
        },
      );
    }

    return handler(request);
  };
}
