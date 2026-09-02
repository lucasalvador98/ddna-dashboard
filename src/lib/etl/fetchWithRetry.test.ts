import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWithRetry } from './fetchWithRetry';

describe('fetchWithRetry', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('returns on first success', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 } as Response);
    vi.stubGlobal('fetch', mockFetch);
    const res = await fetchWithRetry('https://example.com', { retries: 2 });
    expect(res.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('retries on 500 and succeeds', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200 } as Response);
    vi.stubGlobal('fetch', mockFetch);
    const res = await fetchWithRetry('https://example.com', { retries: 2, backoffMs: [10, 10] });
    expect(res.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('does not retry on 404', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 404 } as Response);
    vi.stubGlobal('fetch', mockFetch);
    await expect(fetchWithRetry('https://example.com', { retries: 2, backoffMs: [10] })).rejects.toThrow('HTTP 404');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
