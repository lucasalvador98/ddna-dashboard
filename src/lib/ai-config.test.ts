import { describe, expect, it } from 'vitest';
import { chatProviderBody } from './ai-config';

describe('chatProviderBody', () => {
  it('adds reasoning controls for GPT-6 models', () => {
    const body = chatProviderBody('gpt-6-luna', 'none');

    expect(body.reasoning_effort).toBe('none');
    expect(body).toHaveProperty('prompt_cache_key');
  });

  it('omits reasoning controls for non-reasoning models', () => {
    const body = chatProviderBody('gpt-4.1-nano');

    expect(body).not.toHaveProperty('reasoning_effort');
    expect(body).not.toHaveProperty('prompt_cache_key');
  });
});
