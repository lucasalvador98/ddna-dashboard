/**
 * PDF Extractor — serverless-safe
 * Uses dynamic import for pdf-parse, graceful fallback if unavailable.
 */
export interface PDFExtractResult {
  text: string;
  pages: number;
  metadata: {
    title?: string;
    author?: string;
    creationDate?: string;
    pageCount: number;
  };
}

async function tryPdfParse(buffer: Buffer): Promise<PDFExtractResult | null> {
  try {
    // Dynamic import — avoids bundling canvas in serverless
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod: any = await import('pdf-parse');
    const pdfParse = typeof mod === 'function' ? mod : mod.default;
    if (typeof pdfParse !== 'function') return null;
    const data = await pdfParse(buffer);
    return {
      text: data.text || '',
      pages: data.numpages || 0,
      metadata: {
        title: data.info?.Title,
        author: data.info?.Author,
        creationDate: data.info?.CreationDate,
        pageCount: data.numpages || 0,
      },
    };
  } catch {
    return null;
  }
}

function rawExtract(buffer: Buffer): PDFExtractResult {
  // Best-effort text extraction from raw buffer
  const text = buffer
    .toString('utf-8')
    .replace(/[^\x20-\x7E\xA0-\xFF\u00C0-\u024F\n\r\t.,;:!?¿¡()\[\]{}]/g, ' ')
    .replace(/\s{3,}/g, '\n\n')
    .trim();
  return {
    text: text.length > 50 ? text : '',
    pages: 1,
    metadata: { pageCount: 1 },
  };
}

export async function extractTextFromPDF(buffer: Buffer): Promise<PDFExtractResult> {
  // Try pdf-parse first (works locally with canvas)
  const result = await tryPdfParse(buffer);
  if (result && result.text.length > 50) return result;

  // Fallback: raw extraction
  const raw = rawExtract(buffer);
  if (raw.text.length > 50) return raw;

  // Nothing worked
  return {
    text: '[PDF extraction not available in this environment. Process PDFs locally with `node scripts/backfill.mjs`]',
    pages: 0,
    metadata: { pageCount: 0 },
  };
}

export async function extractPDFFromFile(file: File): Promise<PDFExtractResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return extractTextFromPDF(buffer);
}
