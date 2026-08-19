'use client';

import { useState } from 'react';
import { ReportModal } from '@/components/report-modal';

export default function EjecutivoReport() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p className="text-lg font-medium">Informe cerrado</p>
        <button
          onClick={() => setIsOpen(true)}
          className="mt-4 px-4 py-2 bg-[var(--ddna-blue)] text-white rounded-lg text-sm hover:opacity-90"
        >
          Volver a abrir
        </button>
      </div>
    );
  }

  return <ReportModal isOpen onClose={() => setIsOpen(false)} />;
}
