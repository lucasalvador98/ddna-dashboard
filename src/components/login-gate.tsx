'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Lock, ShieldX, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { dashboardPath } from '@/lib/app-path';
import { canAccessPath, type EffectivePermissions } from '@/lib/rbac-types';

interface AuthConfig {
  enabled: boolean;
  protected_routes: string[];
}

/**
 * Fetch with a hard timeout. If the request does not settle within `ms`, the
 * AbortController aborts it and the promise rejects — so a cold-starting server
 * chain can never leave a loading flag hanging forever.
 */
async function fetchWithTimeout(url: string, ms = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Rutas que nunca requieren permiso
const PUBLIC_ROUTES = ['/login', '/api/'];

/**
 * Check if a pathname is under any of the public route prefixes.
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r));
}

/**
 * LoginGate — client-side access control gate with RBAC.
 *
 * Behavior:
 *  - Loading → spinner
 *  - auth.enabled === false → render children (public access)
 *  - Public routes (/login, /api/*) → render children
 *  - auth.enabled + NOT authenticated → "Acceso restringido"
 *  - auth.enabled + authenticated + has permission → render children
 *  - auth.enabled + authenticated + NO permission → "Sin permiso"
 *
 * Permissions come from /api/auth/me/permissions (self endpoint, any
 * authenticated user). /api/auth/roles is admin-only, so it can never be the
 * source for a non-admin session.
 */
export function LoginGate({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [effective, setEffective] = useState<EffectivePermissions>({});
  const [permsLoading, setPermsLoading] = useState(false);
  const [permsLoaded, setPermsLoaded] = useState(false);
  const [roleName, setRoleName] = useState<string | null>(null);

  // ── Cargar config de auth ─────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const res = await fetchWithTimeout(dashboardPath('/api/auth/config'));

        if (cancelled) return;

        if (!res.ok) {
          // Non-ok (e.g. anonymous 401) — fail-closed: keep auth ENABLED
          setConfig({ enabled: true, protected_routes: [] });
          return;
        }

        const data = (await res.json()) as Partial<AuthConfig>;
        if (cancelled) return;

        if (typeof data.enabled !== 'boolean') {
          // Invalid shape — fail-closed
          setConfig({ enabled: true, protected_routes: [] });
          return;
        }

        setConfig({
          enabled: data.enabled,
          protected_routes: data.protected_routes ?? [],
        });
      } catch {
        // Invalid JSON / timeout / abort — fail-closed: keep auth ENABLED
        if (!cancelled) {
          setConfig({ enabled: true, protected_routes: [] });
        }
      } finally {
        // Single attempt — no retry window where children render unprotected
        if (!cancelled) setConfigLoading(false);
      }
    }

    loadConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Cargar permisos cuando el usuario está autenticado ────────────────────

  useEffect(() => {
    // Nothing to load while signed out. `permsLoaded`/`permsLoading` only drive
    // render branches that require `user`, and `hasPermission` below treats a
    // missing user as "no permission", so there is no stale value to clear.
    if (!user) return;

    let cancelled = false;

    async function loadPermissions() {
      setPermsLoading(true);
      setPermsLoaded(false);
      try {
        const res = await fetchWithTimeout(dashboardPath('/api/auth/me/permissions'));

        if (cancelled) return;

        if (!res.ok) {
          // 401/500 — show "Sin acceso" instead of an infinite spinner.
          console.warn('[LoginGate] permissions fetch failed', res.status);
          setRoleName(null);
          setEffective({});
          setPermsLoaded(true);
          return;
        }

        let payload: unknown = null;
        try {
          payload = await res.json();
        } catch {
          // Invalid JSON — treated as an error below
        }

        if (cancelled) return;

        const data = payload as {
          role?: { name?: string } | null;
          effective?: unknown;
        } | null;

        if (!data || typeof data !== 'object' || !data.effective || typeof data.effective !== 'object') {
          console.warn('[LoginGate] permissions payload has an invalid shape', payload);
          setRoleName(null);
          setEffective({});
          setPermsLoaded(true);
          return;
        }

        setRoleName(data.role?.name ?? null);
        setEffective(data.effective as EffectivePermissions);
        setPermsLoaded(true);
      } catch (err) {
        // Si falla la red, dejamos permisos vacíos pero marcamos como cargados para no quedar en spinner infinito
        console.warn('[LoginGate] unexpected error loading permissions', err);
        if (!cancelled) {
          setEffective({});
          setPermsLoaded(true);
        }
      } finally {
        if (!cancelled) setPermsLoading(false);
      }
    }

    loadPermissions();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // ── Verificar si la ruta actual tiene permiso ─────────────────────────────

  const isAdmin = roleName === 'admin';

  const hasPermission = useMemo(() => {
    if (!user) return false;
    if (isPublicRoute(pathname)) return true;
    // Same rule the auth proxy enforces server-side (src/lib/auth-proxy.ts).
    return canAccessPath(effective, pathname, { isAdmin });
  }, [user, pathname, effective, isAdmin]);

  // ── Determinar estado final ───────────────────────────────────────────────

  const showGate = config?.enabled === true && !user;
  const showDenied = config?.enabled === true && user && !hasPermission && permsLoaded;

  // ── Loading ───────────────────────────────────────────────────────────────
  // Only show full-page spinner on initial load — after mount, keep children mounted
  // to avoid full app reload when Supabase does a token refresh on tab visibilitychange
  const isInitialLoading = configLoading || (authLoading && !config);
  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-navy animate-spin" />
      </div>
    );
  }

  // ── Auth disabled → acceso público ────────────────────────────────────────

  if (!config?.enabled) {
    return <>{children}</>;
  }

  // ── Auth enabled + autenticado + permisos no cargados → spinner ────────────
  // Evita que se vea contenido antes de verificar permisos

  if (config?.enabled && user && !permsLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-navy animate-spin" />
      </div>
    );
  }

  // ── Auth enabled, NO autenticado → gate ────────────────────────────────────

  if (showGate) {
    return (
      <div className="flex items-center justify-center py-20 px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="font-display text-xl text-navy mb-2">Acceso restringido</h2>
          <p className="font-body text-sm text-gray-500 mb-6">
            Necesitás iniciar sesión para acceder a esta sección.
          </p>
          <Link
            href={`/login?redirect=${encodeURIComponent(pathname)}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-navy text-white font-accent font-semibold rounded-xl hover:bg-[#050506] transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  // ── Auth enabled + autenticado + carga de permisos → spinner ──────────────

  if (permsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-navy animate-spin" />
      </div>
    );
  }

  // ── Auth enabled + autenticado + SIN permiso → denied ─────────────────────

  if (showDenied) {
    return (
      <div className="flex items-center justify-center py-20 px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
            <ShieldX className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="font-display text-xl text-navy mb-2">Sin acceso</h2>
          <p className="font-body text-sm text-gray-500 mb-2">
            Tu rol <span className="font-semibold text-gray-700">{roleName ?? '—'}</span> no tiene permiso
            para acceder a esta sección.
          </p>
          <p className="font-body text-sm text-gray-400 mb-6">
            Contactá al administrador si necesitás acceso.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-navy text-white font-accent font-semibold rounded-xl hover:bg-[#050506] transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // ── Auth enabled + autenticado + con permiso → renderizar ─────────────────

  return <>{children}</>;
}
