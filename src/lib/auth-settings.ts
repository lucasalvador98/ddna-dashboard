// Shared source of truth for the auth settings row (key=auth).
//
// Server-only module — imported by the auth proxy middleware and the
// /api/auth/config route. The client never reads the settings table
// directly; it consumes this shape through the config endpoint.

interface AuthSettings {
  enabled: boolean;
  protected_routes: string[];
  /** true when the row could not be read: values are a safe default, not config */
  degraded: boolean;
}

/**
 * Safe default used when the settings row cannot be read. `enabled: true` keeps
 * auth on; `protected_routes: []` is NOT "nothing is protected" here, because
 * `degraded: true` tells the proxy to protect every route. Consumers must never
 * treat an empty list as public access while `degraded` is true.
 */
const DEGRADED_SETTINGS: AuthSettings = {
  enabled: true,
  protected_routes: [],
  degraded: true,
};

let cachedSettings: AuthSettings | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5_000;

/**
 * Read the auth settings row (key=auth) from the settings table via the
 * service_role REST client, cached in-memory for CACHE_TTL ms.
 *
 * Three-state contract (an unreadable row is NOT "nothing is protected"):
 *  - Missing env vars → DEGRADED_SETTINGS (auth stays on, every route protected)
 *  - Fetch error or non-ok response → DEGRADED_SETTINGS (PostgREST cold start /
 *    network issue: auth stays on, every route protected)
 *  - Successful read → the row's values with `degraded: false`; only then does
 *    an empty `protected_routes` mean "no route is configured as protected"
 */
export async function getAuthSettings(): Promise<AuthSettings> {
  const now = Date.now();
  if (cachedSettings && now - cacheTimestamp < CACHE_TTL) {
    return cachedSettings;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    cachedSettings = DEGRADED_SETTINGS;
    cacheTimestamp = now;
    return cachedSettings;
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/settings?key=eq.auth&select=value`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      // PostgREST cold start — the row is unknown, not "nothing protected"
      cachedSettings = DEGRADED_SETTINGS;
      cacheTimestamp = now;
      return cachedSettings;
    }

    const rows = (await res.json()) as Array<{ value: Record<string, unknown> }>;
    const value = rows?.[0]?.value as {
      enabled?: boolean;
      protected_routes?: string[];
    } | null;

    cachedSettings = {
      enabled: value?.enabled ?? false,
      protected_routes: value?.protected_routes ?? [],
      degraded: false,
    };
  } catch {
    // Network error — the row is unknown, not "nothing protected"
    cachedSettings = DEGRADED_SETTINGS;
  }

  cacheTimestamp = now;
  return cachedSettings;
}
