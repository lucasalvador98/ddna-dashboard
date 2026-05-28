import { NextResponse } from 'next/server';

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
  try {
    const contentType = request.headers.get('content-type') || '';

    if (!contentType.includes('multipart/form-data') && !contentType.includes('application/pdf')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const text = await extractTextFromPDF(buffer);

        if (!text || text.length < 10) {
          return NextResponse.json({ error: 'No text could be extracted' }, { status: 422 });
        }

        return NextResponse.json({ text, length: text.length });
      }

      return NextResponse.json(
        { error: 'No file provided. Send as multipart/form-data with field "file"' },
        { status: 400 }
      );
    }

    // Raw PDF binary
    const buffer = Buffer.from(await request.arrayBuffer());
    const text = await extractTextFromPDF(buffer);

    if (!text || text.length < 10) {
      return NextResponse.json({ error: 'No text could be extracted from PDF' }, { status: 422 });
    }

    return NextResponse.json({ text, length: text.length });
  } catch (err) {
    console.error('PDF extraction error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
