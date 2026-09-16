import { Suspense } from 'react';
import { PageLoading } from '@/components/page-loading';
import { listFormularios } from '@/lib/formularios/queries';
import { FormulariosClient } from './formularios-client';

// Force dynamic rendering — this page fetches from Supabase at request time.
// Static prerender fails because PostgREST isn't available during build.
export const dynamic = 'force-dynamic';

async function FormulariosContent() {
  const formularios = await listFormularios();
  return <FormulariosClient formularios={formularios} />;
}

export default function FormulariosPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <FormulariosContent />
    </Suspense>
  );
}
