'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Loader2, ShieldX } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { dashboardPath } from '@/lib/app-path';

export type AdminAccessStatus = 'loading' | 'admin' | 'non-admin' | 'unavailable';

interface AccessResult {
  userId: string;
  status: AdminAccessStatus;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function fetchAdminAccess(userId: string, signal: AbortSignal): Promise<AdminAccessStatus> {
  const [configResponse, permissionsResponse] = await Promise.all([
    fetch(dashboardPath('/api/auth/config'), { cache: 'no-store', signal }),
    fetch(dashboardPath('/api/auth/me/permissions'), { cache: 'no-store', signal }),
  ]);

  if (!configResponse.ok || !permissionsResponse.ok) throw new Error('Access verification failed');

  const [config, permissions] = await Promise.all([
    configResponse.json() as Promise<unknown>,
    permissionsResponse.json() as Promise<unknown>,
  ]);

  if (
    !isRecord(config) ||
    typeof config.enabled !== 'boolean' ||
    !Array.isArray(config.protected_routes) ||
    !isRecord(permissions) ||
    permissions.user_id !== userId ||
    !isRecord(permissions.effective) ||
    !('role' in permissions)
  ) {
    throw new Error('Access response has an invalid shape');
  }

  if (permissions.role === null) return 'non-admin';
  if (!isRecord(permissions.role) || typeof permissions.role.name !== 'string') {
    throw new Error('Role response has an invalid shape');
  }

  return permissions.role.name === 'admin' ? 'admin' : 'non-admin';
}

export function useAdminAccess(): AdminAccessStatus {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const [result, setResult] = useState<AccessResult | null>(null);

  useEffect(() => {
    if (authLoading || !userId) return;

    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    void fetchAdminAccess(userId, controller.signal)
      .then((status) => {
        if (!cancelled) setResult({ userId, status });
      })
      .catch(() => {
        if (!cancelled) setResult({ userId, status: 'unavailable' });
      })
      .finally(() => clearTimeout(timeoutId));

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [authLoading, userId]);

  if (authLoading) return 'loading';
  if (!userId) return 'non-admin';
  return result?.userId === userId ? result.status : 'loading';
}

export function AdminOnlyGate({
  feature,
  children,
}: {
  feature: string;
  children: ReactNode;
}) {
  const status = useAdminAccess();

  if (status === 'admin') return <>{children}</>;

  if (status === 'loading') {
    return (
      <div role="status" className="flex items-center justify-center gap-3 py-16 text-sm text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        Verificando permisos de acceso...
      </div>
    );
  }

  const unavailable = status === 'unavailable';
  return (
    <div
      role={unavailable ? 'alert' : 'status'}
      className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center"
    >
      <ShieldX className="w-10 h-10 text-amber-600" />
      <p className="max-w-lg text-sm text-gray-600">
        {unavailable
          ? 'No se pudieron verificar los permisos. Esta función está temporalmente deshabilitada.'
          : `Solo las personas con rol de administrador pueden utilizar ${feature}.`}
      </p>
    </div>
  );
}
