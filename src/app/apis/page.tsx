import { Suspense } from 'react';
import { Database } from 'lucide-react';
import { SectionHeader } from '@/components/section-header';
import { PageLoading } from '@/components/page-loading';
import { ApisClient } from './apis-client';

interface CKANPackageListResponse {
  result: string[];
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
  let initialData: Awaited<ReturnType<typeof fetchInitialData>>;
  try {
    initialData = await fetchInitialData();
  } catch {
    initialData = { source: 'datos.gob.ar', total: 0, datasets: [] };
  }
  return <ApisClient initialData={initialData} />;
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
