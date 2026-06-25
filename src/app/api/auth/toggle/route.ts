import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

/**
 * POST /api/auth/toggle
 *
 * Toggles the auth enabled/disabled flag in the settings table.
 * Body: { enabled: boolean }
 * Uses the service_role key — safe because this is a server-side API route.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { enabled?: unknown };

    if (typeof body.enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Se requiere el campo "enabled" (boolean)' },
        { status: 400 }
      );
    }

    const adminClient = getSupabaseClient();

    // Read current settings to preserve protected_routes and other keys
    const { data: current } = await adminClient
      .from('settings')
      .select('value')
      .eq('key', 'auth')
      .single();

    const currentValue = (current?.value as Record<string, unknown>) || {};
    const newValue = { ...currentValue, enabled: body.enabled };

    const { error } = await adminClient
      .from('settings')
      .update({
        value: newValue,
        updated_at: new Date().toISOString(),
      })
      .eq('key', 'auth');

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, enabled: body.enabled });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
