'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Lock, Loader2, LogOut } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';

interface AuthConfig {
  enabled: boolean;
  protected_routes: string[];
}

/**
 * LoginGate — client-side access control gate for protected pages.
 *
 * Reads the auth config from the `settings` table (via anon client),
 * and the current session from AuthProvider context.
 *
 * Behavior:
 *  - Loading config or session → shows spinner
 *  - auth.enabled === false → renders children directly (no gate)
 *  - auth.enabled === true + authenticated → renders children directly
 *  - auth.enabled === true + NOT authenticated → shows "Acceso restringido" gate
 */
export function LoginGate({ children }: { children: React.ReactNode }) {
  const { user, signOut, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const { data } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'auth')
          .single();

        if (!cancelled && data?.value) {
          setConfig(data.value as AuthConfig);
        }
      } catch {
        // Auth disabled by default if settings can't be read
      } finally {
        if (!cancelled) setConfigLoading(false);
      }
    }

    loadConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Loading state ──────────────────────────────────────────────────────────

  if (configLoading || authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#1a2556] animate-spin" />
      </div>
    );
  }

  // ── Auth disabled → allow unrestricted access ──────────────────────────────

  if (!config?.enabled) {
    return <>{children}</>;
  }

  // ── Auth enabled + authenticated → allow access with session bar ───────────

  if (user) {
    return (
      <>
        {/* Session bar — shows current user and logout */}
        <div className="bg-blue-50/50 border-b border-blue-100 px-4 py-2 flex items-center justify-between gap-3 text-sm">
          <span className="text-gray-500 text-xs">
            <span className="text-gray-400">Conectado como</span>{' '}
            <span className="text-[#1a2556] font-medium">{user.email}</span>
          </span>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
        {children}
      </>
    );
  }

  // ── Auth enabled + NOT authenticated → show gate ───────────────────────────

  return (
    <div className="flex items-center justify-center py-20 px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="font-display text-xl text-[#1a2556] mb-2">Acceso restringido</h2>
        <p className="font-body text-sm text-gray-500 mb-6">
          Necesitás iniciar sesión para acceder a esta sección.
        </p>
        <Link
          href={`/login?redirect=${encodeURIComponent(pathname)}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a2556] text-white font-accent font-semibold rounded-xl hover:bg-[#0f1740] transition-colors"
        >
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
}
