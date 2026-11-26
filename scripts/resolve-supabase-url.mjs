/** @param {{ NEXT_PUBLIC_SUPABASE_URL?: string }} [env] */
export function resolveSupabaseUrl(env = process.env) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is missing or empty. Set it in .env.local to the self-hosted Supabase URL: https://supabase.ddna.com.ar',
    );
  }

  return url;
}
