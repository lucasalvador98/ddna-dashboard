/**
 * PDF Extractor - Legacy implementation
 * PDF extraction is disabled due to Node.js server limitations in Next.js
 * PDFs should be converted to text offline before uploading
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

/**
 * Extract text from PDF buffer - returns placeholder
 */
export async function extractTextFromPDF(_buffer: Buffer): Promise<PDFExtractResult> {
  return {
    text: '[PDF extraction not supported in serverless environment. Please convert PDFs to text offline.]',
    pages: 0,
    metadata: {
      pageCount: 0,
    },
  };
}

/**
 * Extract text from PDF file
 */
export async function extractPDFFromFile(_file: File): Promise<PDFExtractResult> {
  return extractTextFromPDF(Buffer.from([]));
}
