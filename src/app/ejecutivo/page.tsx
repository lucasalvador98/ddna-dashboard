'use client';

/**
 * Informe Ejecutivo — Generador de informes con IA.
 *
 * Reemplaza el dashboard estático de KPIs por el generador de informes
 * que antes estaba solo como modal en el homepage.
 */

import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import { ReportModal } from '@/components/report-modal';
import { LoginGate } from '@/components/login-gate';
import { SectionHeader } from '@/components/section-header';
import { useState, useEffect } from 'react';
import { PageError } from '@/components/page-error';
import { PageLoading } from '@/components/page-loading';

export default function EjecutivoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadPage() {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 100));
        if (mounted) setError(null);
      } catch {
        if (mounted) setError('Error al cargar el informe ejecutivo. Por favor, intenta nuevamente.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPage();

    return () => {
      mounted = false;
    };
  }, []);

  const handleRetry = () => {
    const loadPage = async () => {
      try {
        setLoading(true);
        setError(null);
      } catch {
        setError('Error al cargar el informe ejecutivo. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    loadPage();
  };

  if (loading) {
    return (
      <LoginGate>
        <PageLoading message="Cargando informe ejecutivo..." />
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
      <div className="space-y-6">
        <SectionHeader
          icon={FileText}
          title="Informe Ejecutivo"
          description="Generador de informes con IA sobre indicadores DDNA"
          color="terracotta"
        />
        <ReportModal isOpen onClose={() => router.push('/')} />
      </div>
    </LoginGate>
  );
}
