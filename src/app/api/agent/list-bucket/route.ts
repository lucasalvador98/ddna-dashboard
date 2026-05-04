import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    const { search_query } = await request.json();

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get documents from repositorio table
    let query = supabase
      .from('repositorio')
      .select('id, nombre_archivo, tipo_documento, url_storage, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (search_query) {
      query = query.ilike('nombre_archivo', `%${search_query}%`);
    }

    const { data: files, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format response
    const filesList = (files || []).map((f: any) => ({
      id: f.id,
      name: f.nombre_archivo,
      type: f.tipo_documento,
      url: f.url_storage,
    }));

    return NextResponse.json({
      files: filesList,
      total: filesList.length,
    });
  } catch (err) {
    console.error('List bucket error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
