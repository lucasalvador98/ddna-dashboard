/**
 * Informe Ejecutivo — Generador de informes con IA.
 *
 * Reemplaza el dashboard estático de KPIs por el generador de informes
 * que antes estaba solo como modal en el homepage.
 *
 * NOTE: This page is a Server Component. The artificial loading/error
 * states have been removed (they served no real purpose).
 */

import { FileText } from 'lucide-react';
import { LoginGate } from '@/components/login-gate';
import { SectionHeader } from '@/components/section-header';
import EjecutivoReport from './ejecutivo-report';

export default function EjecutivoPage() {
  return (
    <LoginGate>
      <div className="space-y-6">
        <SectionHeader
          icon={FileText}
          title="Informe Ejecutivo"
          description="Generador de informes con IA sobre indicadores DDNA"
          color="terracotta"
        />
        <EjecutivoReport />
      </div>
    </LoginGate>
  );
}
