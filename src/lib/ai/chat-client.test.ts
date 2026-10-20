import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchChatCompletion } from './chat-client';

function mockResponse(status: number, body: unknown = {}): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
    json: async () => body,
  } as unknown as Response;
}

function request(overrides: Partial<Parameters<typeof fetchChatCompletion>[0]> = {}) {
  return {
    primaryModel: 'primary-model',
    fallbackModel: 'fallback-model',
    buildBody: (model: string) => ({ model, messages: [] }),
    timeoutMs: 1000,
    fallbackTimeoutMs: 500,
    maxRetries: 1,
    ...overrides,
  };
}

describe('fetchChatCompletion', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns the primary response when it succeeds', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(200, { choices: [] }));

    const result = await fetchChatCompletion(request());

    expect(result.modelUsed).toBe('primary-model');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries a 429 on the primary model and then succeeds', async () => {
    vi.useFakeTimers();
    fetchMock
      .mockResolvedValueOnce(mockResponse(429, { error: { message: 'rate limit' } }))
      .mockResolvedValueOnce(mockResponse(200, { choices: [] }));

    const pending = fetchChatCompletion(request({ maxRetries: 2 }));
    await vi.advanceTimersByTimeAsync(10_000);
    const result = await pending;

    expect(result.modelUsed).toBe('primary-model');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('falls back to the secondary model after a 5xx', async () => {
    fetchMock
      .mockResolvedValueOnce(mockResponse(503, { error: { message: 'unavailable' } }))
      .mockResolvedValueOnce(mockResponse(200, { choices: [] }));

    const result = await fetchChatCompletion(request());

    expect(result.modelUsed).toBe('fallback-model');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const fallbackBody = JSON.parse(String(fetchMock.mock.calls[1][1]?.body));
    expect(fallbackBody.model).toBe('fallback-model');
  });

  it('does not fall back on an auth error', async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse(401, { error: { message: 'invalid api key' } }),
    );

    await expect(fetchChatCompletion(request())).rejects.toThrow(/401/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('falls back on a timeout without retrying the primary model', async () => {
    const timeout = new Error('timed out');
    timeout.name = 'TimeoutError';
    fetchMock
      .mockRejectedValueOnce(timeout)
      .mockResolvedValueOnce(mockResponse(200, { choices: [] }));

    const result = await fetchChatCompletion(request({ maxRetries: 3 }));

    expect(result.modelUsed).toBe('fallback-model');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('falls back after a network error', async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(mockResponse(200, { choices: [] }));

    const result = await fetchChatCompletion(request());

    expect(result.modelUsed).toBe('fallback-model');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not fall back when the fallback model is disabled', async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse(500, { error: { message: 'boom' } }),
    );

    await expect(
      fetchChatCompletion(request({ fallbackModel: null })),
    ).rejects.toThrow(/500/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
