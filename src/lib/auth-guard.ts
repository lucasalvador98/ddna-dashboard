import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import {
  mergePermissions,
  type PermissionsPayload,
  type RolePermission,
  type UserPermission,
} from '@/lib/rbac-types';

interface AuthUser {
  id: string;
  email: string;
}

interface GuardResult {
  authorized: boolean;
  user?: AuthUser;
  response?: NextResponse;
}

/** Build a Supabase server client from the request session cookies. */
async function createSessionClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Persist rotated tokens. getUser()/refresh can rotate the session
          // server-side; dropping the new cookies leaves the browser with a
          // revoked refresh token and the user stuck in a 401 loop.
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

/**
 * Verify the request is from an authenticated user (any role).
 * Reads session from cookies using createServerClient (@supabase/ssr).
 * Does NOT require any role — role checks are the caller's responsibility.
 *
 * Returns:
 *   { authorized: true, user } when authenticated
 *   { authorized: false, response } with 401/500 when not
 */
export async function checkAuth(): Promise<GuardResult> {
  try {
    const supabase = await createSessionClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'No autenticado. Inicie sesión para continuar.' },
          { status: 401 }
        ),
      };
    }

    return {
      authorized: true,
      user: {
        id: user.id,
        email: user.email ?? '',
      },
    };
  } catch (err) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Error interno al verificar autenticación.' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Verify the request is from an authenticated admin user.
 * Reads session from cookies using createServerClient (@supabase/ssr).
 * Then checks user_roles table to confirm admin role.
 *
 * Returns:
 *   { authorized: true, user } when authenticated admin
 *   { authorized: false, response } with 401/403/500 when not
 */
export async function checkAdminAuth(): Promise<GuardResult> {
  try {
    const supabase = await createSessionClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'No autenticado. Inicie sesión para continuar.' },
          { status: 401 }
        ),
      };
    }

    // Verify the user has admin role in user_roles
    const adminClient = getSupabaseAdminClient();
    const { data: userRole } = await adminClient
      .from('user_roles')
      .select('role_id, roles(name)')
      .eq('user_id', user.id)
      .maybeSingle();

    const rolesData = userRole?.roles;
    const roleName =
      rolesData &&
      (Array.isArray(rolesData) ? (rolesData[0] as { name: string } | undefined) : (rolesData as { name: string }))
        ?.name;

    if (roleName !== 'admin') {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Se requiere rol de administrador para esta operación.' },
          { status: 403 }
        ),
      };
    }

    return {
      authorized: true,
      user: {
        id: user.id,
        email: user.email ?? '',
      },
    };
  } catch (err) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Error interno al verificar autenticación.' },
        { status: 500 }
      ),
    };
  }
}

/** Built-in role names that cannot be deleted or renamed. */
export const BUILT_IN_ROLES = ['admin', 'agente', 'visor'];

/**
 * Resolve the merged permission matrix of a user: the role base
 * (public.role_permissions) plus the per-user extras
 * (public.user_permissions, additive — see mergePermissions).
 *
 * Server-only: reads the RBAC tables with the service_role client, so the
 * caller must already have passed a guard (checkAuth / checkAdminAuth).
 *
 * Throws on a fatal read error (the caller maps it to a 500). A failure while
 * reading the extras is non-fatal: the role base is still returned with a
 * warning, so a deployment that lands before the user_permissions migration
 * degrades to the role matrix instead of locking every user out.
 */
export async function resolvePermissions(userId: string): Promise<PermissionsPayload> {
  const adminClient = getSupabaseAdminClient();

  const { data: roleRow, error: roleError } = await adminClient
    .from('user_roles')
    .select('role_id, roles(name)')
    .eq('user_id', userId)
    .maybeSingle();

  if (roleError) {
    throw new Error(roleError.message);
  }

  const roleId = typeof roleRow?.role_id === 'number' ? roleRow.role_id : null;
  const rolesData = (
    Array.isArray(roleRow?.roles) ? roleRow?.roles[0] : roleRow?.roles
  ) as { name: string } | null | undefined;

  let base: RolePermission[] = [];

  if (roleId !== null) {
    const { data, error } = await adminClient
      .from('role_permissions')
      .select('route, can_view, can_edit')
      .eq('role_id', roleId);

    if (error) {
      throw new Error(error.message);
    }

    base = (data ?? []) as RolePermission[];
  }

  const warnings: string[] = [];
  let extras: UserPermission[] = [];

  const extrasResult = await adminClient
    .from('user_permissions')
    .select('route, can_view, can_edit')
    .eq('user_id', userId);

  if (extrasResult.error) {
    warnings.push(
      `No se pudieron leer los permisos por usuario: ${extrasResult.error.message}`
    );
  } else {
    extras = (extrasResult.data ?? []) as UserPermission[];
  }

  return {
    user_id: userId,
    role: roleId !== null ? { id: roleId, name: rolesData?.name ?? '' } : null,
    base_permissions: base,
    extras,
    effective: mergePermissions(base, extras),
    ...(warnings.length > 0 ? { warnings } : {}),
  };
}
