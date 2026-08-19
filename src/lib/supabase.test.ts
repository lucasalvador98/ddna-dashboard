import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

describe('supabase', () => {
  afterAll(() => {
    vi.unstubAllEnvs();
  });

  describe('isSupabaseConfigured', () => {
    it('returns true when env vars are set', async () => {
      vi.resetModules();
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

      const { isSupabaseConfigured } = await import('./supabase');
      expect(isSupabaseConfigured()).toBe(true);
    });
  });

  describe('getBrowserClient', () => {
    it('returns a Supabase client instance', async () => {
      vi.resetModules();
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

      const { getBrowserClient } = await import('./supabase');
      const client = getBrowserClient();
      expect(client).toBeDefined();
      expect(typeof client.from).toBe('function');
    });
  });

  describe('getSupabaseAdminClient', () => {
    it('returns an admin client when service role key is set', async () => {
      vi.resetModules();
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key');

      const { getSupabaseAdminClient } = await import('./supabase');
      const client = getSupabaseAdminClient();
      expect(client).toBeDefined();
      expect(typeof client.from).toBe('function');
    });

    it('throws when service role key is missing', async () => {
      vi.resetModules();
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

      // Ensure SERVICE_ROLE_KEY is NOT set in the environment
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');

      const { getSupabaseAdminClient } = await import('./supabase');
      expect(() => getSupabaseAdminClient()).toThrow('Supabase admin not configured');
    });
  });
});
