/**
 * PDF Extractor — serverless-safe
 *
 * Uses pdf-parse's `PDFParse` class. That is the only extraction path.
 *
 * There used to be a raw-bytes fallback here that stripped non-printable
 * characters from the buffer. Compressed PDF streams are not text, so it
 * produced binary noise that still passed the length check, got chunked,
 * embedded and stored as document content. On 2026-11-04 every one of the five
 * PDFs in the corpus was made of that noise: `ConsumosAdolescentes` chunks read
 * "0 i ~ , ], $ ! ? $b # [ { w V [ h + V x = & p d j qg", while the real
 * document is "Consumos adolescentes: nuevas racionalidades...". Those
 * documents were unreachable by both the text index and vector search.
 *
 * pdf-parse is only a default export in v1. Version 2.4.5 exports the class,
 * `mod.default` is undefined, and the old `mod.default` lookup returned null on
 * every call — so the raw fallback was silently the only running path.
 *
 * A failed extraction returns empty text, which process-document treats as a
 * failure. Returning a placeholder, or guessing from raw bytes, stores invented
 * content as knowledge.
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

/** Below this, the extraction is a scanned page or a parse failure. */
const MIN_USEFUL_TEXT = 50;

async function tryPdfParse(buffer: Buffer): Promise<PDFExtractResult | null> {
  try {
    const { PDFParse } = await import('pdf-parse');
    // Copy into a fresh Uint8Array: pdf-parse transfers typed arrays to its
    // worker thread and would take ownership of (detach) the caller's buffer.
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const result = await parser.getText();
      const pageCount = result.pages?.length ?? 0;
      return {
        text: result.text ?? '',
        pages: pageCount,
        metadata: { pageCount },
      };
    } finally {
      await parser.destroy();
    }
  } catch {
    return null;
  }
}

export async function extractTextFromPDF(buffer: Buffer): Promise<PDFExtractResult> {
  const result = await tryPdfParse(buffer);
  if (result && result.text.trim().length >= MIN_USEFUL_TEXT) return result;

  return {
    text: '',
    pages: 0,
    metadata: { pageCount: 0 },
  };
}

export async function extractPDFFromFile(file: File): Promise<PDFExtractResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return extractTextFromPDF(buffer);
}
