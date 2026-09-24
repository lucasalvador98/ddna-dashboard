import { createClient } from '@supabase/supabase-js';
import { Suspense } from 'react';
import { PageLoading } from '@/components/page-loading';
import RepositorioClient from './repositorio-client';
import type { RepoFile } from '@/lib/repositorio';
import { hasPublicSupabaseConfig } from '@/lib/runtime-config';
import { SupabaseUnavailable } from '@/components/supabase-unavailable';

async function RepositorioContent() {
  if (!hasPublicSupabaseConfig()) {
    return <SupabaseUnavailable />;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data, error } = await supabase
    .from('repositorio')
    .select('*')
    .order('categoria', { ascending: true })
    .order('nombre_archivo', { ascending: true });

  if (error) throw error;

  return <RepositorioClient initialFiles={(data || []) as RepoFile[]} />;
}

export default function RepositorioPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <RepositorioContent />
    </Suspense>
  );
}
