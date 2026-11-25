import { describe, expect, it } from 'vitest';

import { resolveSupabaseUrl } from '../scripts/resolve-supabase-url.mjs';

describe('resolveSupabaseUrl', () => {
  it('throws and names NEXT_PUBLIC_SUPABASE_URL when it is missing', () => {
    expect(() => resolveSupabaseUrl({})).toThrowError(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it('throws when NEXT_PUBLIC_SUPABASE_URL is an empty string', () => {
    expect(() => resolveSupabaseUrl({ NEXT_PUBLIC_SUPABASE_URL: '' })).toThrowError(
      /NEXT_PUBLIC_SUPABASE_URL/,
    );
  });

  it('returns a provided NEXT_PUBLIC_SUPABASE_URL unchanged', () => {
    const url = 'https://supabase.ddna.com.ar';

    expect(resolveSupabaseUrl({ NEXT_PUBLIC_SUPABASE_URL: url })).toBe(url);
  });
});
