import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { StorageClient } from '@supabase/storage-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdf = require('pdf-parse');

// Dynamic extractors
async function extractText(fileType: string, buffer: Buffer) {
  if (fileType === 'pdf') {
    const data = await pdf(buffer);
    return { text: data.text, pages: data.numpages };
  } else if (fileType === 'docx' || fileType === 'doc') {
    const { extractTextFromDOCX } = await import('@/lib/rag/extractors/docx');
    return extractTextFromDOCX(buffer);
  } else if (fileType === 'xlsx' || fileType === 'xls') {
    const { extractTextFromXLSX } = await import('@/lib/rag/extractors/xlsx');
    return extractTextFromXLSX(buffer);
  }
  throw new Error(`Unsupported file type: ${fileType}`);
}

export async function POST(request: Request) {
  try {
    const { file_id } = await request.json();

    if (!file_id) {
      return NextResponse.json({ error: 'file_id requerido' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get file info
    const { data: fileData, error: fileError } = await supabase
      .from('repositorio')
      .select('id, nombre_archivo, tipo_documento, url_storage')
      .eq('id', file_id)
      .single();

    if (fileError || !fileData) {
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });
    }

    // Extract file path from URL
    const filePath = fileData.url_storage?.split('/storage/v1/object/public/ddna-repositorio/')[1];

    if (!filePath) {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 });
    }

    // Download from storage
    const storage = new StorageClient(`${supabaseUrl}/storage/v1`, {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    });

    const { data: fileBuffer, error: downloadError } = await storage
      .from('ddna-repositorio')
      .download(filePath);

    if (downloadError || !fileBuffer) {
      return NextResponse.json({ error: `Error al descargar: ${downloadError}` }, { status: 500 });
    }

    // Convert to buffer
    const buffer = Buffer.from(await fileBuffer.arrayBuffer());
    const fileType = fileData.tipo_documento?.toLowerCase();

    // Extract text
    let content = '';
    try {
      if (fileType) {
        const result = await extractText(fileType, buffer);
        content = result.text;
      } else {
        content = buffer.toString('utf-8').substring(0, 5000);
      }
    } catch (extractError) {
      content = `[Error al extraer: ${extractError}]`;
    }

    return NextResponse.json({
      file_id,
      name: fileData.nombre_archivo,
      type: fileType,
      content: content.substring(0, 8000), // Limit to 8k chars
      size: buffer.length,
    });
  } catch (err) {
    console.error('Download file error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
