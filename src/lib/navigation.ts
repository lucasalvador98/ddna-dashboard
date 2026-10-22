import {
  Home,
  Heart,
  HeartPulse,
  BookOpen,
  ClipboardList,
  Users,
  Shield,
  Coins,
  Map,
  Database,
  FolderOpen,
  FileText,
  Settings,
  Newspaper,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { dashboardPath } from '@/lib/app-path';
import {
  canAccessPath,
  type EffectivePermissions,
  type PermissionsPayload,
} from '@/lib/rbac-types';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  icon: LucideIcon;
  color: string;
  items: NavItem[];
}

export const navigation: NavGroup[] = [
  {
    label: 'Inicio',
    icon: Home,
    color: '#FF8C00',
    items: [{ label: 'Tablero General', href: '/', icon: Home }],
  },
  {
    label: 'Salud',
    icon: Heart,
    color: '#C2410C',
    items: [
      { label: 'Indicadores', href: '/salud', icon: Heart },
      { label: 'Adolescente', href: '/salud-adolescente', icon: HeartPulse },
    ],
  },
  {
    label: 'Educación',
    icon: BookOpen,
    color: '#FF8C00',
    items: [{ label: 'Educación', href: '/educacion', icon: BookOpen }],
  },
  {
    label: 'Condiciones Sociales',
    icon: Users,
    color: '#8A4B4B',
    items: [
      { label: 'Pobreza e Indigencia', href: '/pobreza', icon: Users },
      { label: 'Encuestas 2024', href: '/encuestas', icon: ClipboardList },
      { label: 'Infancias', href: '/infancias', icon: Users },
    ],
  },
  {
    label: 'Población',
    icon: Users,
    color: '#165DFF',
    items: [{ label: 'Población y Demografía', href: '/poblacion', icon: Users }],
  },
  {
    label: 'Seguridad',
    icon: Shield,
    color: '#165DFF',
    items: [{ label: 'Justicia', href: '/seguridad', icon: Shield }],
  },
  {
    label: 'Inversión Social',
    icon: Coins,
    color: '#C2410C',
    items: [{ label: 'Presupuesto NNyA', href: '/inversion', icon: Coins }],
  },
  {
    label: 'Monitoreo',
    icon: Newspaper,
    color: '#6B4A9C',
    items: [{ label: 'Monitoreo de Medios', href: '/monitoreo', icon: Newspaper }],
  },
  {
    label: 'Documentos',
    icon: FolderOpen,
    color: '#356B6B',
    items: [
      { label: 'Repositorio', href: '/repositorio', icon: FolderOpen },
      { label: 'Informe Ejecutivo', href: '/ejecutivo', icon: FileText },
    ],
  },
  {
    label: 'Datos',
    icon: Database,
    color: '#356B6B',
    items: [
      { label: 'Mapas', href: '/geo', icon: Map },
      { label: 'Fuentes de Datos', href: '/fuentes', icon: Database },
    ],
  },
  {
    label: 'Formularios',
    icon: ClipboardList,
    color: '#FF8C00',
    items: [{ label: 'Formularios', href: '/formularios', icon: ClipboardList }],
  },
  {
    label: 'Admin',
    icon: Settings,
    color: '#5B5755',
    items: [{ label: 'Configuración', href: '/admin', icon: Settings }],
  },
];

export const routeTitles: Record<string, string> = {
  '/': 'Tablero General de Monitoreo',
  '/salud': 'Indicadores de Salud',
  '/salud-adolescente': 'Salud Adolescente',
  '/educacion': 'Indicadores de Educación',

  '/encuestas': 'Encuestas 2024',
  '/pobreza': 'Indicadores de Pobreza',
  '/infancias': 'Infancias — Barómetro UCA',
  '/poblacion': 'Población y Demografía',
  '/seguridad': 'Indicadores de Seguridad',
  '/inversion': 'Inversión Social',
  '/geo': 'Mapas',
  '/fuentes': 'Catálogo de Fuentes y APIs',
  '/repositorio': 'Repositorio Documental',
  '/repositorio/chat': 'Chat con la Bibliografía',
  '/ejecutivo': 'Informe Ejecutivo',
  '/monitoreo': 'Monitoreo de Medios',
  '/formularios': 'Formularios',
  '/admin': 'Configuración',
  '/apis': 'APIs',
};

/** Find which group a route belongs to (for auto-expanding sidebar) */
export function findGroupForPath(pathname: string): string | null {
  for (const group of navigation) {
    for (const item of group.items) {
      if (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))) {
        return group.label;
      }
    }
  }
  return null;
}

// ─── Navigation access (permissions) ────────────────────────────────────────
//
// The sidebar hides what the caller's merged matrix does not grant. This is a
// cosmetic/UX filter: the authoritative denials are server-side (auth-proxy +
// the LoginGate on gated screens), so a failure to resolve permissions never
// blanks the navigation — it degrades to "show everything", same as public
// mode.

export interface NavigationAccess {
  /** true once the access model is known (either resolved or degraded). */
  ready: boolean;
  /** true only when auth is enabled AND the caller has a session. */
  filtered: boolean;
  effective: EffectivePermissions;
  isAdmin: boolean;
}

const ACCESS_UNFILTERED: NavigationAccess = {
  ready: true,
  filtered: false,
  effective: {},
  isAdmin: false,
};

// Deduplicates the concurrent mounts of Sidebar and MobileNav: at most one
// request per page load. Cleared as soon as it settles (no stale cache).
let inFlightAccess: Promise<NavigationAccess> | null = null;

async function fetchNavigationAccess(): Promise<NavigationAccess> {
  try {
    const configRes = await fetch(dashboardPath('/api/auth/config'), { cache: 'no-store' });

    if (!configRes.ok) return ACCESS_UNFILTERED;

    const config = (await configRes.json()) as { enabled?: boolean } | null;

    // Public mode (or an unreadable config): nothing is filtered, exactly like
    // before the RBAC screens existed.
    if (config?.enabled !== true) return ACCESS_UNFILTERED;

    const res = await fetch(dashboardPath('/api/auth/me/permissions'), { cache: 'no-store' });

    // No session / expired session: leave the navigation untouched and let the
    // page-level gates decide.
    if (!res.ok) return ACCESS_UNFILTERED;

    const payload = (await res.json()) as Partial<PermissionsPayload> | null;

    if (!payload || typeof payload !== 'object' || typeof payload.effective !== 'object') {
      return ACCESS_UNFILTERED;
    }

    return {
      ready: true,
      filtered: true,
      effective: payload.effective as EffectivePermissions,
      isAdmin: payload.role?.name === 'admin',
    };
  } catch {
    return ACCESS_UNFILTERED;
  }
}

/** Resolve (and dedupe) the caller's navigation access. */
export function loadNavigationAccess(): Promise<NavigationAccess> {
  if (!inFlightAccess) {
    inFlightAccess = fetchNavigationAccess().finally(() => {
      inFlightAccess = null;
    });
  }
  return inFlightAccess;
}

/** React hook consumed by Sidebar and MobileNav. */
export function useNavigationAccess(): NavigationAccess {
  const [access, setAccess] = useState<NavigationAccess>({
    ...ACCESS_UNFILTERED,
    ready: false,
    filtered: false,
  });

  useEffect(() => {
    let cancelled = false;

    void loadNavigationAccess().then((resolved) => {
      if (!cancelled) setAccess(resolved);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return access;
}

/**
 * Filter the navigation groups with a resolved access model.
 * Groups left without items are dropped; while permissions are unknown the
 * navigation is rendered untouched (no empty flash on first paint).
 */
export function filterNavigationAccess(
  groups: NavGroup[],
  access: NavigationAccess,
): NavGroup[] {
  if (!access.filtered) return groups;

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        canAccessPath(access.effective, item.href, { isAdmin: access.isAdmin }),
      ),
    }))
    .filter((group) => group.items.length > 0);
}
