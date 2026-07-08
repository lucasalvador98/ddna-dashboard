import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

/**
 * GET  /api/auth/admins — List admin users
 * POST /api/auth/admins — Create a new admin user
 */

export async function GET() {
  try {
    const adminClient = getSupabaseClient();

    const { data, error } = await adminClient.auth.admin.listUsers();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const admins = (data?.users || [])
      .filter(u => u.user_metadata?.role === 'admin')
      .map(u => ({
        email: u.email,
        created_at: u.created_at,
      }));

    return NextResponse.json(admins);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json() as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json({ error: 'Se requiere email y password' }, { status: 400 });
    }

    const adminClient = getSupabaseClient();

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin' },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Assign admin role in user_roles
    if (data?.user?.id) {
      const { error: roleError } = await adminClient
        .from('user_roles')
        .upsert(
          { user_id: data.user.id, role_id: 1 }, // 1 = admin role
          { onConflict: 'user_id' }
        );

      if (roleError) {
        console.error('Error assigning admin role:', roleError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
