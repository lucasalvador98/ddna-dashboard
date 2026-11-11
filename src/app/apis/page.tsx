import { Suspense } from 'react';
import { Database } from 'lucide-react';
import { SectionHeader } from '@/components/section-header';
import { PageLoading } from '@/components/page-loading';
import { ApisClient } from './apis-client';

interface CKANPackageListResponse {
  result: string[];
}

interface EndpointData {
  source: string;
  datasets?: string[];
  total?: number;
}

async function fetchInitialData() {
  const url = new URL('https://datos.gob.ar/api/3/action/package_list');
  url.searchParams.set('limit', '50');
  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`CKAN returned ${res.status}`);
  const json: CKANPackageListResponse = await res.json();
  const datasets = (json.result || []).filter((name) =>
    /educacion|salud|ninez|ninios|adolesc|pobreza|trabajo|ingresos|indicadores/.test(name)
  );
  return {
    source: 'datos.gob.ar',
    total: datasets.length,
    datasets,
  };
}

async function ApisContent() {
  let initialData: EndpointData | null = null;
  let initialError: string | null = null;

  try {
    initialData = await fetchInitialData();
  } catch {
    initialError = 'No se pudo cargar el catálogo de datos.';
  }
  return <ApisClient initialData={initialData} initialError={initialError} />;
}

export default function ApisPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Database}
        title="APIs y Fuentes de Datos"
        description="Explorador de catálogos de datos públicos conectados al dashboard DDNA"
        color="navy"
      />
      <Suspense fallback={<PageLoading />}>
        <ApisContent />
      </Suspense>
    </div>
  );
}
