// Shared source of truth for the auth settings row (key=auth).
//
// Server-only module — imported by the auth proxy middleware and the
// /api/auth/config route. The client never reads the settings table
// directly; it consumes this shape through the config endpoint.

interface AuthSettings {
  enabled: boolean;
  protected_routes: string[];
}

let cachedSettings: AuthSettings | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5_000;

/**
 * Read the auth settings row (key=auth) from the settings table via the
 * service_role REST client, cached in-memory for CACHE_TTL ms.
 *
 * Fail-closed behavior:
 *  - Missing env vars → { enabled: false, protected_routes: [] } (auth off)
 *  - Fetch error or non-ok response → { enabled: true, protected_routes: [] }
 *    (PostgREST cold start / network issue — keep auth ENABLED so it is
 *    never bypassed)
 */
export async function getAuthSettings(): Promise<AuthSettings> {
  const now = Date.now();
  if (cachedSettings && now - cacheTimestamp < CACHE_TTL) {
    return cachedSettings;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    cachedSettings = { enabled: false, protected_routes: [] };
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
      // PostgREST cold start — default to ENABLED so auth isn't bypassed
      cachedSettings = { enabled: true, protected_routes: [] };
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
    };
  } catch {
    // Network error — default to ENABLED so auth isn't bypassed
    cachedSettings = { enabled: true, protected_routes: [] };
  }

  cacheTimestamp = now;
  return cachedSettings;
}