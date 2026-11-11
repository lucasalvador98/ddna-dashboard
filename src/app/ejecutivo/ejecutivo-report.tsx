'use client';

import { useState } from 'react';
import { ReportModal } from '@/components/report-modal';
import { AdminOnlyGate } from '@/components/admin-access-gate';

export default function EjecutivoReport() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <AdminOnlyGate feature="la generación de informes ejecutivos">
        <div className="text-center py-20 text-slate-500">
          <p className="text-lg font-medium">Informe cerrado</p>
          <button
            onClick={() => setIsOpen(true)}
            className="mt-4 px-4 py-2 bg-[var(--ddna-blue)] text-white rounded-lg text-sm hover:opacity-90"
          >
            Volver a abrir
          </button>
        </div>
      </AdminOnlyGate>
    );
  }

  return (
    <AdminOnlyGate feature="la generación de informes ejecutivos">
      <ReportModal isOpen onClose={() => setIsOpen(false)} />
    </AdminOnlyGate>
  );
}
