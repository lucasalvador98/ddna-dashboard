// Public standalone page for a form at /f/[slug]. RSC: fetches the active form
// with an ANON client (RLS `activo = true`), so inactive/missing slugs show the
// unavailable screen. Passes the definition + slug to the client renderer.

import type { Metadata } from 'next';
import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Formulario } from '@/lib/formularios/types';
import { FormularioNoDisponible } from '@/components/formularios/unavailable';
import { PublicFormClient } from './public-form-client';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Dedupes the fetch between generateMetadata and the page within one request.
const fetchActiveFormBySlug = cache(async (slug: string): Promise<Formulario | null> => {
  const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await anon.from('formularios').select('*').eq('slug', slug).maybeSingle();
  if (error) return null;
  return (data as Formulario) ?? null;
});

interface PublicFormPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PublicFormPageProps): Promise<Metadata> {
  const { slug } = await params;
  const form = await fetchActiveFormBySlug(slug);
  return { title: form ? form.titulo : 'Formulario no disponible' };
}

export default async function PublicFormPage({ params }: PublicFormPageProps) {
  const { slug } = await params;
  const form = await fetchActiveFormBySlug(slug);

  if (!form || !form.activo) {
    return <FormularioNoDisponible />;
  }

  return (
    <PublicFormClient
      slug={slug}
      titulo={form.titulo}
      descripcion={form.descripcion}
      definicion={form.definicion}
    />
  );
}
