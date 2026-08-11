// Admin responses page for a single form. RSC: fetches the form (service_role,
// so inactive forms are visible too) and its newest responses, passing both to
// the client. A missing form renders the client "not found" state instead of
// calling notFound() so the page keeps a deterministic empty state.

import { Suspense } from 'react';
import { PageLoading } from '@/components/page-loading';
import { fetchFormById, listRespuestas } from '@/lib/formularios/queries';
import { RespuestasClient } from './respuestas-client';

interface RespuestasPageProps {
  params: Promise<{ id: string }>;
}

async function RespuestasContent({ id }: { id: string }) {
  const [form, respuestas] = await Promise.all([fetchFormById(id), listRespuestas(id)]);
  return <RespuestasClient form={form} respuestas={respuestas} />;
}

export default async function RespuestasPage({ params }: RespuestasPageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<PageLoading />}>
      <RespuestasContent id={id} />
    </Suspense>
  );
}
