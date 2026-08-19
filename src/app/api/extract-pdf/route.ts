import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/agent/rate-limit';

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

// Dynamic import to avoid loading pdf-parse in edge
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const { extractTextFromPDF } = await import('@/lib/rag/extractors/pdf');
    return (await extractTextFromPDF(buffer)).text;
  } catch {
    // Fallback: simple text extraction
    const text = buffer.toString('utf-8');
    // Remove non-printable chars
    return text.replace(/[^\x20-\x7E\xA0-\xFF\u00C0-\u024F\n\r\t]/g, ' ').trim();
  }
}

export async function POST(request: Request) {
  // ── Rate limiting: 20 req/min per IP ──────────────────────────────────────
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const rl = checkRateLimit(`extract-pdf:${ip}`, 20);
  if (!rl.allowed) {
    const retryAfter = Math.ceil(rl.retryAfterMs / 1000);
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intente de nuevo en unos segundos.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  // ── Input validation: content-type ────────────────────────────────────────
  const contentType = request.headers.get('content-type') || '';
  if (
    !contentType.includes('multipart/form-data') &&
    !contentType.includes('application/pdf')
  ) {
    return NextResponse.json(
      { error: 'Tipo de contenido no soportado. Use multipart/form-data o application/pdf.' },
      { status: 415 }
    );
  }

  // ── Input validation: file size ───────────────────────────────────────────
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: 'El archivo excede el tamaño máximo de 20 MB.' },
      { status: 413 }
    );
  }

  try {
    // Multipart/form-data: extract file from form field "file"
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          { error: 'No se encontró el archivo. Envíelo como multipart/form-data con el campo "file".' },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const text = await extractTextFromPDF(buffer);

      if (!text || text.length < 10) {
        return NextResponse.json(
          { error: 'No se pudo extraer texto del archivo.' },
          { status: 422 }
        );
      }

      return NextResponse.json({ text, length: text.length });
    }

    // Raw PDF binary (application/pdf)
    const buffer = Buffer.from(await request.arrayBuffer());
    const text = await extractTextFromPDF(buffer);

    if (!text || text.length < 10) {
      return NextResponse.json(
        { error: 'No se pudo extraer texto del PDF.' },
        { status: 422 }
      );
    }

    return NextResponse.json({ text, length: text.length });
  } catch (err) {
    console.error('PDF extraction error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
