import { Suspense } from 'react';
import { PageLoading } from '@/components/page-loading';
import { listFormularios } from '@/lib/formularios/queries';
import { FormulariosClient } from './formularios-client';

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
