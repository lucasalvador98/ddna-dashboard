import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAuthConfig } from './auth-config';
import { assertAdminAuth } from './assert-admin';

// ─── Mocks ──────────────────────────────────────────────────────
// getAuthConfig reads the settings row key=auth with the service_role client
// (RLS bypass), so the shared admin guard is the only authorization. The real
// retry() wrapper is left in place: without a retryable error it attempts the
// query exactly once, which is what proves the guard runs before data access.

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));

let singleRow: { value: unknown } | null = null;
let queryError: { message: string } | null = null;

vi.mock('@/lib/actions/assert-admin', () => ({
  assertAdminAuth: vi.fn(async () => undefined),
}));
vi.mock('@/lib/supabase', () => ({
  getSupabaseAdminClient: () => ({ from: mockFrom }),
}));

describe('getAuthConfig', () => {
  beforeEach(() => {
    singleRow = null;
    queryError = null;
    vi.clearAllMocks();
    vi.mocked(assertAdminAuth).mockResolvedValue(undefined);
    mockFrom.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: singleRow, error: queryError }),
        }),
      }),
    }));
  });

  it('guards with assertAdminAuth and returns the settings value', async () => {
    singleRow = { value: { enabled: true, protected_routes: ['/admin'] } };

    const result = await getAuthConfig();

    expect(result).toEqual({ data: { value: { enabled: true, protected_routes: ['/admin'] } } });
    expect(assertAdminAuth).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledTimes(1);
  });

  it('rejects and never attempts the query when the guard denies access', async () => {
    vi.mocked(assertAdminAuth).mockRejectedValueOnce(
      new Error('Se requiere rol de administrador para esta operación.')
    );

    await expect(getAuthConfig()).rejects.toThrow(
      'Se requiere rol de administrador para esta operación.'
    );
    expect(assertAdminAuth).toHaveBeenCalledTimes(1);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('returns the query result unchanged when the row has no value', async () => {
    const result = await getAuthConfig();

    expect(result).toEqual({ data: null });
    expect(assertAdminAuth).toHaveBeenCalledTimes(1);
  });
});
