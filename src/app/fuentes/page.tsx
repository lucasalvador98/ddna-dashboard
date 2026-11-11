import { createClient } from '@supabase/supabase-js';
import { Suspense } from 'react';
import { FileText } from 'lucide-react';
import type { FuenteDato } from '@/lib/supabase';
import { SectionHeader } from '@/components/section-header';
import { LoginGate } from '@/components/login-gate';
import { PageLoading } from '@/components/page-loading';
import { FuentesClient } from './fuentes-client';

interface FetchResult {
  fuentes: FuenteDato[];
  error: string | null;
}

async function fetchFuentesData(): Promise<FetchResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { fuentes: [], error: 'Error al cargar las fuentes de datos.' };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from('fuentes_datos')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return { fuentes: [], error: null };
    }

    return { fuentes: data as FuenteDato[], error: null };
  } catch {
    return {
      fuentes: [],
      error: 'Error al cargar las fuentes de datos.',
    };
  }
}

export default function FuentesPage() {
  return (
    <LoginGate>
      <div className="space-y-6">
        <SectionHeader
          icon={FileText}
          title="Catálogo de Fuentes y APIs"
          description="Explorador de fuentes de datos e APIs externas conectadas al dashboard DDNA"
          color="orange"
        />
        <Suspense fallback={<PageLoading />}>
          <FuentesContent />
        </Suspense>
      </div>
    </LoginGate>
  );
}

async function FuentesContent() {
  const result = await fetchFuentesData();
  return (
    <FuentesClient
      initialFuentes={result.fuentes}
      initialError={result.error}
      initialLastFetch={new Date().toISOString()}
    />
  );
}
