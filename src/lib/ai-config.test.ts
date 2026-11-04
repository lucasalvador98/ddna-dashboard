import { afterEach, describe, expect, it, vi } from 'vitest';
import { chatProviderBody } from './ai-config';

describe('chatProviderBody', () => {
  it('adds reasoning controls for GPT-6 models', () => {
    const body = chatProviderBody('gpt-6-luna', 'none');

    expect(body.reasoning_effort).toBe('none');
    expect(body).toHaveProperty('prompt_cache_key');
  });

  it('omits reasoning controls for non-reasoning models', () => {
    const body = chatProviderBody('deepseek-flash');

    expect(body).not.toHaveProperty('reasoning_effort');
    expect(body).not.toHaveProperty('prompt_cache_key');
  });
});

// OpenAI rejects sampling parameters on reasoning models unless reasoning is
// disabled, and fetchChatCompletion never retries a 400. These cases pin the
// coupling between the two parameters.
describe('chatProviderBody temperature', () => {
  it('sends temperature when reasoning is disabled', () => {
    const body = chatProviderBody('gpt-6-luna', 'none', 0.3);

    expect(body.temperature).toBe(0.3);
    expect(body.reasoning_effort).toBe('none');
  });

  it('resolves the default effort when the caller passes undefined', () => {
    // The routes pass `undefined` for the primary model, so the default effort
    // decides whether the hardcoded temperature is legal.
    const body = chatProviderBody('gpt-6-luna', undefined, 0.3);

    expect(body.reasoning_effort).toBe('none');
    expect(body.temperature).toBe(0.3);
  });

  it('omits temperature when reasoning is enabled', () => {
    const body = chatProviderBody('gpt-6-luna', 'low', 0.3);

    expect(body.reasoning_effort).toBe('low');
    expect(body).not.toHaveProperty('temperature');
  });

  it('sends temperature for non-reasoning models', () => {
    const body = chatProviderBody('deepseek-flash', undefined, 0.4);

    expect(body.temperature).toBe(0.4);
  });

  it('omits temperature entirely when the caller passes none', () => {
    const body = chatProviderBody('gpt-6-luna', 'none');

    expect(body).not.toHaveProperty('temperature');
  });
});

// ai-config reads its env at module load, so cases that depend on environment
// values need a fresh module instance.
describe('ai-config defaults', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('defaults the fallback model to one that still exists', async () => {
    vi.stubEnv('OPENAI_FALLBACK_MODEL', '');
    vi.resetModules();
    const config = await import('./ai-config');

    // gpt-4.1-nano was shut down by OpenAI on 2026-10-23 and silently broke
    // every fallback attempt.
    expect(config.FALLBACK_MODEL).toBe('gpt-5.6-luna');
  });

  it('defaults the fallback reasoning effort to none so function calling survives', async () => {
    vi.stubEnv('OPENAI_FALLBACK_REASONING_EFFORT', '');
    vi.resetModules();
    const config = await import('./ai-config');

    expect(config.FALLBACK_REASONING_EFFORT).toBe('none');
  });

  it('strips sampling parameters leaked through OPENAI_CHAT_EXTRA_BODY', async () => {
    vi.stubEnv(
      'OPENAI_CHAT_EXTRA_BODY',
      '{"temperature":0.9,"top_p":0.5,"thinking":{"type":"disabled"}}',
    );
    vi.resetModules();
    const config = await import('./ai-config');

    const reasoningBody = config.chatProviderBody('gpt-6-luna', 'low', 0.3);
    expect(reasoningBody).not.toHaveProperty('temperature');
    expect(reasoningBody).not.toHaveProperty('top_p');
    expect(reasoningBody).toHaveProperty('thinking');

    const disabledBody = config.chatProviderBody('gpt-6-luna', 'none', 0.3);
    expect(disabledBody.temperature).toBe(0.3);
  });
});
