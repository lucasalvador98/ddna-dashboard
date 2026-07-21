import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { MapPin } from 'lucide-react';
import { LoginGate } from '@/components/login-gate';
import { PageLoading } from '@/components/page-loading';
import { SectionHeader } from '@/components/section-header';

const GeoMaps = dynamic(() => import('@/components/geo-maps'), { ssr: false });

export default function Page() {
  return (
    <LoginGate>
      <div className="space-y-6">
        <SectionHeader
          icon={MapPin}
          title="Geolocalización"
          description="Mapas interactivos con indicadores sociales y económicos por departamento"
          color="blue"
        />
        <Suspense fallback={<PageLoading />}>
          <GeoMaps />
        </Suspense>
      </div>
    </LoginGate>
  );
}
