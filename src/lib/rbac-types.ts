export interface Role {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  permissions: RolePermission[];
}

export interface RolePermission {
  id: number;
  role_id: number;
  route: string;
  can_view: boolean;
  can_edit: boolean;
}

/**
 * Row of public.user_permissions: a per-user ADDITION on top of the role base.
 * A row only ever grants; revoking is done on the role matrix
 * (public.role_permissions). See mergePermissions() below.
 */
export interface UserPermission {
  id?: number;
  user_id: string;
  route: string;
  can_view: boolean;
  can_edit: boolean;
  created_at?: string;
}

/**
 * API response shape for a user's role.
 *
 * `email` and `role_name` are NOT columns of public.user_roles — the API
 * joins them from auth.users and public.roles. `role_id: 0` with
 * `role_name: 'sin_rol'` means "no role assigned" (no user_roles row).
 */
export interface UserRole {
  user_id: string;
  email: string;
  role_id: number;
  role_name: string;
  created_at: string;
}

/** A single merged permission entry: role base OR per-user extra. */
export interface PermissionEntry {
  can_view: boolean;
  can_edit: boolean;
}

/** Merged permissions keyed by route prefix. */
export type EffectivePermissions = Record<string, PermissionEntry>;

/** Response shape of GET /api/auth/me/permissions and its admin variant. */
export interface PermissionsPayload {
  user_id: string;
  role: { id: number; name: string } | null;
  base_permissions: Array<Pick<RolePermission, 'route' | 'can_view' | 'can_edit'>>;
  extras: Array<Pick<UserPermission, 'route' | 'can_view' | 'can_edit'>>;
  effective: EffectivePermissions;
  /** Non-fatal degradations (e.g. the extras table is missing pre-migration). */
  warnings?: string[];
}

// All available routes in the app (the surface the permission matrix governs)
export const APP_ROUTES = [
  { route: '/admin', label: 'Administración' },
  { route: '/monitoreo', label: 'Monitoreo de Medios' },
  { route: '/repositorio', label: 'Repositorio' },
  { route: '/fuentes', label: 'Fuentes de Datos' },
  { route: '/formularios', label: 'Formularios' },
  { route: '/ejecutivo', label: 'Reporte Ejecutivo' },
  { route: '/presupuesto-nnya', label: 'Presupuesto NNyA' },
  { route: '/geo', label: 'Mapa Geo' },
  { route: '/salud', label: 'Salud' },
  { route: '/salud-adolescente', label: 'Salud Adolescente' },
  { route: '/educacion', label: 'Educación' },
  { route: '/pobreza', label: 'Pobreza' },
  { route: '/encuestas', label: 'Encuestas 2024' },
  { route: '/infancias', label: 'Infancias' },
  { route: '/poblacion', label: 'Población y Demografía' },
  { route: '/seguridad', label: 'Seguridad' },
  { route: '/inversion', label: 'Inversión Social' },
] as const;

/**
 * Prefix match between a permission route and a pathname.
 * "/" only matches "/", "/admin" matches "/admin" and "/admin/roles".
 */
export function routeMatches(pattern: string, pathname: string): boolean {
  if (pattern === '/') return pathname === '/';
  return pathname === pattern || pathname.startsWith(pattern + '/');
}

/**
 * Merge the role base with the per-user extras. Additive on purpose:
 * can_view / can_edit are ORs, so an extra can grant but never revoke what
 * the role already allows (S6: "suman pantallas sobre la base del rol").
 */
export function mergePermissions(
  base: ReadonlyArray<Pick<RolePermission, 'route' | 'can_view' | 'can_edit'>>,
  extras: ReadonlyArray<Pick<UserPermission, 'route' | 'can_view' | 'can_edit'>>,
): EffectivePermissions {
  const effective: EffectivePermissions = {};

  const apply = (
    rows: ReadonlyArray<Pick<RolePermission, 'route' | 'can_view' | 'can_edit'>>,
  ) => {
    for (const row of rows) {
      if (!row?.route) continue;
      const previous = effective[row.route] ?? { can_view: false, can_edit: false };
      effective[row.route] = {
        can_view: previous.can_view || row.can_view,
        can_edit: previous.can_edit || row.can_edit,
      };
    }
  };

  apply(base);
  apply(extras);

  return effective;
}

/**
 * Longest-prefix permission lookup: "/repositorio/chat" matches the
 * "/repositorio" row unless a "/repositorio/chat" row exists.
 */
export function findEffectivePermission(
  effective: EffectivePermissions,
  pathname: string,
): { route: string; permission: PermissionEntry } | null {
  let best: { route: string; permission: PermissionEntry } | null = null;

  for (const [route, permission] of Object.entries(effective)) {
    if (!routeMatches(route, pathname)) continue;
    if (!best || route.length > best.route.length) best = { route, permission };
  }

  return best;
}

/** True when a pathname is covered by a route of the permission matrix. */
export function isGovernedRoute(pathname: string): boolean {
  return APP_ROUTES.some(({ route }) => routeMatches(route, pathname));
}

/**
 * Can this user open this pathname?
 *
 *  - `/admin*` is reserved for the admin role, so it never depends only on a
 *    matrix row (an admin must always keep the way back to the Roles screen).
 *  - Governed route (APP_ROUTES): allowed only when the merged matrix grants
 *    can_view for the longest matching prefix.
 *  - Ungoverned pathname: allowed, preserving the pre-RBAC behavior (the
 *    matrix cannot express a permission for it, so it cannot deny it).
 */
export function canAccessPath(
  effective: EffectivePermissions,
  pathname: string,
  options: { isAdmin?: boolean } = {},
): boolean {
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return options.isAdmin === true;
  }

  const match = findEffectivePermission(effective, pathname);
  if (!match) return !isGovernedRoute(pathname);

  return match.permission.can_view === true;
}
