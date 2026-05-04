/**
 * PDF Extractor - Extract text from PDF files using pdf-parse
 * Works in Node.js environment
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdf = require('pdf-parse');

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
 * Extract text from PDF buffer
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<PDFExtractResult> {
  try {
    const data = await pdf(buffer);

    return {
      text: data.text,
      pages: data.numpages,
      metadata: {
        title: data.info?.Title || undefined,
        author: data.info?.Author || undefined,
        creationDate: data.info?.CreationDate || undefined,
        pageCount: data.numpages,
      },
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract PDF: ${error}`);
  }
}

/**
 * Extract text from PDF file (for API routes)
 */
export async function extractPDFFromFile(file: File): Promise<PDFExtractResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return extractTextFromPDF(buffer);
}
