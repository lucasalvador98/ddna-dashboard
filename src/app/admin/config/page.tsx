'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Loader2, CheckCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { getAuthConfig } from '@/lib/actions/auth-config';

export default function ConfigPage() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [flash, setFlash] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      const { data } = await getAuthConfig();
      setEnabled(data.value?.enabled ?? false);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    // Mount-only config fetch — setState in async callback is intentional
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadConfig();
  }, [loadConfig]);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const r = await fetch('/api/auth/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled }),
      });
      if (r.ok) {
        setEnabled(!enabled);
        setFlash({ type: 'ok', text: !enabled ? 'Autenticación activada' : 'Autenticación desactivada' });
        setTimeout(() => setFlash(null), 4000);
      } else {
        setFlash({ type: 'err', text: 'Error al cambiar' });
      }
    } catch {
      setFlash({ type: 'err', text: 'Error de conexión' });
    }
    setToggling(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-display text-lg text-navy mb-4">Autenticación</h2>

        <div
          className={clsx(
            'p-5 rounded-xl mb-4',
            enabled ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-gray-100',
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-accent text-sm font-semibold text-navy">
                {enabled ? '🔒 Autenticación activada' : '🔓 Sin restricciones'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {enabled
                  ? 'Los usuarios deben iniciar sesión. Los roles controlan el acceso a cada pantalla.'
                  : 'Todas las páginas son públicas — cualquiera puede acceder.'}
              </p>
            </div>
            <button
              onClick={handleToggle}
              disabled={toggling}
              className={clsx(
                'px-5 py-2.5 rounded-xl text-sm font-accent font-semibold transition-all whitespace-nowrap',
                enabled
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                  : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200',
                'disabled:opacity-60',
              )}
            >
              {toggling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : enabled ? (
                'Desactivar'
              ) : (
                'Activar'
              )}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="border-t border-gray-100 pt-4 space-y-3 text-sm text-gray-500">
          <h3 className="font-medium text-navy">¿Cómo funciona?</h3>
          <p>
            Cuando la autenticación está <strong>activada</strong>, cada usuario debe iniciar sesión y su
            rol determina qué pantallas puede ver y editar.
          </p>
          <p>
            Los roles se configuran en la pestaña <strong>Roles</strong>, y los usuarios se asignan en{' '}
            <strong>Usuarios</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
