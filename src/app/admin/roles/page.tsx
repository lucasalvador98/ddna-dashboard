'use client';

import { useCallback, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { RoleManager } from '@/components/admin-role-manager';

export default function RolesPage() {
  const [flash, setFlash] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const flashFn = useCallback((type: 'ok' | 'err', text: string) => {
    setFlash({ type, text });
    setTimeout(() => setFlash(null), 4000);
  }, []);

  return (
    <div className="space-y-4">
      {flash && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
            flash.type === 'ok'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {flash.type === 'ok' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 flex-shrink-0" />
          )}
          {flash.text}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-display text-lg text-[#1a2556] mb-6">Roles y permisos</h2>
        <p className="text-sm text-gray-500 mb-4">
          Cada rol define qué pantallas puede ver y editar. Los roles fijos (admin, editor, visor) no se pueden eliminar.
        </p>
        <RoleManager onFlash={flashFn} />
      </div>
    </div>
  );
}
