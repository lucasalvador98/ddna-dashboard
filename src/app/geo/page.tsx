'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { LoginGate } from '@/components/login-gate';
import { PageError } from '@/components/page-error';
import { PageLoading } from '@/components/page-loading';

const GeoMaps = dynamic(() => import('@/components/geo-maps'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
    </div>
  ),
});

export default function GeoPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    async function loadGeoMaps() {
      try {
        setLoading(true);
        // Dynamic import of GeoMaps component
        const module = await import('@/components/geo-maps');
        setGeoMaps(() => module.default);
        setError(null);
      } catch {
        setError('Error al cargar los mapas geográficos. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    }

    loadGeoMaps();
  }, []);

  const handleRetry = () => {
    loadGeoMaps();
  };

  if (loading) {
    return (
      <LoginGate>
        <PageLoading message="Cargando mapas geográficos..." />
      </LoginGate>
    );
  }

  if (error) {
    return (
      <LoginGate>
        <PageError message={error} onRetry={handleRetry} />
      </LoginGate>
    );
  }

  return (
    <LoginGate>
      <GeoMaps />
    </LoginGate>
  );
}
