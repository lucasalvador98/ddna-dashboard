import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

/**
 * GET /api/auth/config
 *
 * Returns the current auth configuration from the settings table.
 * Uses the service_role key — safe because this is a server-side API route.
 */
export async function GET() {
  try {
    const adminClient = getSupabaseClient();
    const { data, error } = await adminClient
      .from('settings')
      .select('value')
      .eq('key', 'auth')
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: 'Error al cargar la configuración de autenticación' },
      { status: 500 }
    );
  }
}
