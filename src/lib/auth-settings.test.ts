import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The bug lived here: a failed settings read used to return
 * { enabled: true, protected_routes: [] }, which the proxy read as
 * "nothing is protected" and let every route through unauthenticated.
 *
 * The module caches for 5 s, so each case gets a fresh module instance through
 * vi.resetModules() + dynamic import: no production export is added for tests.
 */

const VALID_ROW = {
  value: { enabled: true, protected_routes: ['/admin', '/monitoreo'] },
};

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://unit.invalid');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'unit-service-placeholder');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('getAuthSettings degradation contract', () => {
  it('marks the result degraded on a non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503 })
    );

    const { getAuthSettings } = await import('./auth-settings');
    const settings = await getAuthSettings();

    expect(settings.degraded).toBe(true);
    expect(settings.enabled).toBe(true);
    expect(settings.protected_routes).toEqual([]);
  });

  it('marks the result degraded when the fetch rejects', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network down'))
    );

    const { getAuthSettings } = await import('./auth-settings');
    const settings = await getAuthSettings();

    expect(settings.degraded).toBe(true);
    expect(settings.enabled).toBe(true);
    expect(settings.protected_routes).toEqual([]);
  });

  it('marks the result degraded when the env vars are missing', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');

    const { getAuthSettings } = await import('./auth-settings');
    const settings = await getAuthSettings();

    expect(settings.degraded).toBe(true);
    expect(settings.enabled).toBe(true);
    expect(settings.protected_routes).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns the parsed row and not degraded on a successful read', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [VALID_ROW],
      })
    );

    const { getAuthSettings } = await import('./auth-settings');
    const settings = await getAuthSettings();

    expect(settings).toEqual({
      enabled: true,
      protected_routes: ['/admin', '/monitoreo'],
      degraded: false,
    });
  });
});
