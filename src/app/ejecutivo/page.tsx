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

export default function EjecutivoPage() {
  const router = useRouter();

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
