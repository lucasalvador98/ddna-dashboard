'use client';

/**
 * Informe Ejecutivo — Generador de informes con IA.
 *
 * Reemplaza el dashboard estático de KPIs por el generador de informes
 * que antes estaba solo como modal en el homepage.
 */

import { ReportModal } from '@/components/report-modal';

export default function EjecutivoPage() {
  return (
    <div className="space-y-6">
      <ReportModal isOpen onClose={() => {}} />
    </div>
  );
}
