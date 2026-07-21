import { createClient } from '@supabase/supabase-js';
import { Suspense } from 'react';
import { FileText } from 'lucide-react';
import type { FuenteDato } from '@/lib/supabase';
import { SectionHeader } from '@/components/section-header';
import { LoginGate } from '@/components/login-gate';
import { PageLoading } from '@/components/page-loading';
import { FuentesClient } from './fuentes-client';

const fallbackFuentes: FuenteDato[] = [
  {
    id: '1',
    nombre: 'Ministerio de Salud de Córdoba',
    organizacion: 'Gobierno de Córdoba',
    url: 'https://salud.cba.gov.ar',
    frecuencia: 'Trimestral',
    categoria: 'salud',
    ultima_actualizacion: '2024-12-15',
    metodo_ingesta: 'api',
    created_at: '2024-01-01',
  },
  {
    id: '2',
    nombre: 'Ministerio de Educación',
    organizacion: 'Gobierno de Córdoba',
    url: 'https://educacion.cba.gov.ar',
    frecuencia: 'Anual',
    categoria: 'educacion',
    ultima_actualizacion: '2024-11-30',
    metodo_ingesta: 'csv_upload',
    created_at: '2024-01-01',
  },
  {
    id: '3',
    nombre: 'INDEC - EPH',
    organizacion: 'Gobierno Nacional',
    url: 'https://www.indec.gob.ar',
    frecuencia: 'Semestral',
    categoria: 'pobreza',
    ultima_actualizacion: '2024-09-30',
    metodo_ingesta: 'api',
    created_at: '2024-01-01',
  },
  {
    id: '4',
    nombre: 'Secretaría de Niñez',
    organizacion: 'Gobierno de Córdoba',
    url: 'https://ninez.cba.gov.ar',
    frecuencia: 'Mensual',
    categoria: 'seguridad',
    ultima_actualizacion: '2024-12-01',
    metodo_ingesta: 'api',
    created_at: '2024-01-01',
  },
  {
    id: '5',
    nombre: 'Ministerio de Finanzas',
    organizacion: 'Gobierno de Córdoba',
    url: 'https://finanzas.cba.gov.ar',
    frecuencia: 'Trimestral',
    categoria: 'inversion',
    ultima_actualizacion: '2024-10-31',
    metodo_ingesta: 'manual',
    created_at: '2024-01-01',
  },
  {
    id: '6',
    nombre: 'Dirección General de Estadística',
    organizacion: 'Gobierno de Córdoba',
    url: 'https://estadistica.cba.gov.ar',
    frecuencia: 'Decenal',
    categoria: 'demografia',
    ultima_actualizacion: '2022-05-18',
    metodo_ingesta: 'csv_upload',
    created_at: '2024-01-01',
  },
];

interface FetchResult {
  fuentes: FuenteDato[];
  usingFallback: boolean;
  error: string | null;
}

async function fetchFuentesData(): Promise<FetchResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { fuentes: fallbackFuentes, usingFallback: true, error: null };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data, error } = await supabase
      .from('fuentes_datos')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return { fuentes: fallbackFuentes, usingFallback: true, error: null };
    }

    return { fuentes: data as FuenteDato[], usingFallback: false, error: null };
  } catch {
    return {
      fuentes: fallbackFuentes,
      usingFallback: true,
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
      initialUsingFallback={result.usingFallback}
      initialError={result.error}
      initialLastFetch={new Date().toISOString()}
    />
  );
}
