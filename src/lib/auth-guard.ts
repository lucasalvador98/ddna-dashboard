import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';

interface AuthUser {
  id: string;
  email: string;
}

interface GuardResult {
  authorized: boolean;
  user?: AuthUser;
  response?: NextResponse;
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
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // No-op in API routes — we never set cookies from API handlers
          },
        },
      }
    );

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
export const BUILT_IN_ROLES = ['admin', 'editor', 'visor'];
