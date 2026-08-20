'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Lock, ShieldX, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import type { RolePermission } from '@/lib/rbac-types';

interface AuthConfig {
  enabled: boolean;
  protected_routes: string[];
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
 * Check if a pathname matches a permission route (prefix match).
 * e.g. route "/admin" matches "/admin", "/admin/roles", etc.
 */
function routeMatches(pattern: string, pathname: string): boolean {
  if (pattern === '/') return pathname === '/';
  return pathname === pattern || pathname.startsWith(pattern + '/');
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
 */
export function LoginGate({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [permsLoading, setPermsLoading] = useState(false);
  const [permsLoaded, setPermsLoaded] = useState(false);
  const [roleName, setRoleName] = useState<string | null>(null);

  // ── Cargar config de auth ─────────────────────────────────────────────────

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

  // ── Cargar rol + permisos cuando el usuario está autenticado ──────────────

  useEffect(() => {
    if (!user) {
      setPermissions([]);
      setRoleName(null);
      return;
    }

    const userId = user.id; // capture for TS strict
    let cancelled = false;

    async function loadRoleAndPermissions() {
      setPermsLoading(true);
      setPermsLoaded(false);
      try {
        // 1. Obtener el rol del usuario
        const roleRes = await fetch(`/api/auth/users/${userId}/role`);
        const roleData = await roleRes.json();

        if (cancelled) return;

        if (!roleData.role_name) {
          setRoleName(null);
          setPermissions([]);
          setPermsLoaded(true);
          return;
        }

        setRoleName(roleData.role_name);

        // 2. Obtener todos los roles con permisos y filtrar por el nuestro
        const rolesRes = await fetch('/api/auth/roles');
        const roles = await rolesRes.json();

        if (cancelled) return;

        const myRole = (roles as Array<{ id: number; name: string; permissions: RolePermission[] }>).find(
          (r) => r.name === roleData.role_name,
        );

        setPermissions(myRole?.permissions ?? []);
        setPermsLoaded(true);
      } catch {
        // Si falla la red, dejamos permisos vacíos pero marcamos como cargados
        setPermsLoaded(true);
      } finally {
        if (!cancelled) setPermsLoading(false);
      }
    }

    loadRoleAndPermissions();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // ── Verificar si la ruta actual tiene permiso ─────────────────────────────

  const hasPermission = useMemo(() => {
    if (isPublicRoute(pathname)) return true;
    return permissions.some((p) => p.can_view && routeMatches(p.route, pathname));
  }, [pathname, permissions]);

  // ── Determinar estado final ───────────────────────────────────────────────

  const showGate = config?.enabled === true && !user;
  const showDenied = config?.enabled === true && user && !hasPermission && permsLoaded;

  // ── Loading ───────────────────────────────────────────────────────────────

  if (configLoading || authLoading) {
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-navy text-white font-accent font-semibold rounded-xl hover:bg-[#0F172A] transition-colors"
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-navy text-white font-accent font-semibold rounded-xl hover:bg-[#0F172A] transition-colors"
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
