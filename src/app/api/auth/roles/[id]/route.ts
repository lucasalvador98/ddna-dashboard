import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

/**
 * DELETE /api/auth/roles/[id] — Delete a role (CASCADE deletes permissions & user_roles)
 * PATCH  /api/auth/roles/[id] — Update role name/description
 */

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const roleId = Number(id);

    if (!Number.isFinite(roleId)) {
      return NextResponse.json({ error: 'ID de rol inválido' }, { status: 400 });
    }

    const adminClient = getSupabaseClient();

    const { error } = await adminClient.from('roles').delete().eq('id', roleId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const roleId = Number(id);

    if (!Number.isFinite(roleId)) {
      return NextResponse.json({ error: 'ID de rol inválido' }, { status: 400 });
    }

    const body = (await request.json()) as {
      name?: unknown;
      description?: unknown;
    };

    const updates: Record<string, string> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return NextResponse.json(
          { error: 'El nombre debe ser un texto no vacío' },
          { status: 400 },
        );
      }
      updates.name = body.name.trim();
    }

    if (body.description !== undefined) {
      if (typeof body.description !== 'string') {
        return NextResponse.json(
          { error: 'La descripción debe ser un texto' },
          { status: 400 },
        );
      }
      updates.description = body.description.trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No hay campos válidos para actualizar' },
        { status: 400 },
      );
    }

    const adminClient = getSupabaseClient();

    const { data: updatedRole, error } = await adminClient
      .from('roles')
      .update(updates)
      .eq('id', roleId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updatedRole);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 },
    );
  }
}
