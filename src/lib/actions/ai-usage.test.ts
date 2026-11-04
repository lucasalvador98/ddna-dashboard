import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUsageStats, type AiUsageLog } from './ai-usage';
import { assertAdminAuth } from './assert-admin';

// ─── Mocks ──────────────────────────────────────────────────────
// getUsageStats reads ai_usage_logs with the service_role client (RLS bypass),
// so the shared admin guard is the only authorization. We mock the guard and
// the admin client, and exercise the real query logic.

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));

let rows: AiUsageLog[] = [];
let queryError: { message: string } | null = null;

vi.mock('@/lib/actions/assert-admin', () => ({
  assertAdminAuth: vi.fn(async () => undefined),
}));
vi.mock('@/lib/supabase', () => ({
  getSupabaseAdminClient: () => ({ from: mockFrom }),
}));

const LOG: AiUsageLog = {
  id: 1,
  tool: 'resumen',
  model: 'gpt-4o-mini',
  prompt_tokens: 100,
  completion_tokens: 50,
  total_tokens: 150,
  cost_estimate: 0.0002,
  error: null,
  metadata: { fuente: 'test' },
  created_at: '2026-08-11T13:00:00Z',
};

describe('getUsageStats', () => {
  beforeEach(() => {
    rows = [];
    queryError = null;
    vi.clearAllMocks();
    vi.mocked(assertAdminAuth).mockResolvedValue(undefined);
    mockFrom.mockImplementation(() => ({
      select: () => ({
        gte: () => ({
          order: () => ({
            limit: async () => ({ data: rows, error: queryError }),
          }),
        }),
      }),
    }));
  });

  it('guards with assertAdminAuth and returns the rows', async () => {
    rows = [LOG];

    const result = await getUsageStats(7);

    expect(result).toEqual([LOG]);
    expect(assertAdminAuth).toHaveBeenCalledTimes(1);
  });

  it('rejects and never queries when the guard denies access', async () => {
    vi.mocked(assertAdminAuth).mockRejectedValueOnce(
      new Error('Se requiere rol de administrador para esta operación.')
    );

    await expect(getUsageStats(7)).rejects.toThrow(
      'Se requiere rol de administrador para esta operación.'
    );
    expect(assertAdminAuth).toHaveBeenCalledTimes(1);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('returns an empty list when there are no logs', async () => {
    const result = await getUsageStats(7);

    expect(result).toEqual([]);
    expect(assertAdminAuth).toHaveBeenCalledTimes(1);
  });
});
