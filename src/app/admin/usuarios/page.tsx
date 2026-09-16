'use client';

import { useCallback, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { UsersRolesManager } from '@/components/admin-users-roles';

export default function UsuariosPage() {
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
        <h2 className="font-display text-lg text-navy mb-2">Usuarios y Roles</h2>
        <p className="text-sm text-gray-500 mb-6">
          Gestioná los usuarios del sistema, asignales roles y configurá los permisos de cada rol.
        </p>
        <UsersRolesManager onFlash={flashFn} />
      </div>
    </div>
  );
}
