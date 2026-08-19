import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PageLoading } from '@/components/page-loading';
import { fetchFormById } from '@/lib/formularios/queries';
import { BuilderClient } from './builder-client';

interface BuilderPageProps {
  params: Promise<{ id: string }>;
}

async function BuilderContent({ params }: BuilderPageProps) {
  const { id } = await params;
  const form = await fetchFormById(id);
  if (!form) notFound();

  return (
    <BuilderClient
      formId={form.id}
      initialTitulo={form.titulo}
      initialDescripcion={form.descripcion ?? ''}
      initialSlug={form.slug}
      initialDefinicion={form.definicion}
    />
  );
}

export default function BuilderPage({ params }: BuilderPageProps) {
  return (
    <Suspense fallback={<PageLoading />}>
      <BuilderContent params={params} />
    </Suspense>
  );
}
