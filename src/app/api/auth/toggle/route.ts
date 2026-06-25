import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

/**
 * POST /api/auth/toggle
 *
 * Updates auth settings: enabled flag and/or protected routes.
 * Body: { enabled?: boolean, protected_routes?: string[] }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      enabled?: unknown;
      protected_routes?: unknown;
    };

    if (typeof body.enabled !== 'boolean' && !Array.isArray(body.protected_routes)) {
      return NextResponse.json(
        { error: 'Se requiere "enabled" (boolean) o "protected_routes" (array)' },
        { status: 400 }
      );
    }

    const adminClient = getSupabaseClient();

    const { data: current } = await adminClient
      .from('settings')
      .select('value')
      .eq('key', 'auth')
      .single();

    const currentValue = (current?.value as Record<string, unknown>) || {};
    const newValue: Record<string, unknown> = { ...currentValue };

    if (typeof body.enabled === 'boolean') newValue.enabled = body.enabled;
    if (Array.isArray(body.protected_routes)) newValue.protected_routes = body.protected_routes;

    const { error } = await adminClient
      .from('settings')
      .update({
        value: newValue,
        updated_at: new Date().toISOString(),
      })
      .eq('key', 'auth');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, ...newValue });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
