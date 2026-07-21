'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  RefreshCw,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import clsx from 'clsx';
import { getAdminStats } from '@/lib/actions/admin-stats';

export function AdminUpdateButton() {
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const router = useRouter();

  const refresh = useCallback(async () => {
    setLoading(true);
    setFlash(null);
    try {
      await getAdminStats();
      setFlash({ type: 'ok', text: 'Datos actualizados correctamente' });
      router.refresh();
    } catch {
      setFlash({ type: 'err', text: 'Error al actualizar los datos' });
    }
    setLoading(false);
    setTimeout(() => setFlash(null), 4000);
  }, [router]);

  return (
    <div className="space-y-3">
      {flash && (
        <div
          className={clsx(
            'flex items-center gap-2 px-4 py-3 rounded-xl text-sm',
            flash.type === 'ok'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200',
          )}
        >
          {flash.type === 'ok' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 flex-shrink-0" />
          )}
          {flash.text}
        </div>
      )}
      <button
        onClick={refresh}
        disabled={loading}
        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm text-[#1a2556] font-medium transition-colors text-left disabled:opacity-60"
      >
        <RefreshCw className={clsx('w-4 h-4 text-gray-500', loading && 'animate-spin')} />
        Actualizar datos
      </button>
    </div>
  );
}
