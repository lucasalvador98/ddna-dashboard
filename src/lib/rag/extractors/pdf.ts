/**
 * PDF Extractor using pdf-parse
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');

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

export async function extractTextFromPDF(buffer: Buffer): Promise<PDFExtractResult> {
  try {
    const data = await pdfParse(buffer, {
      // Disable canvas rendering for serverless
      pagerender: undefined,
    });

    return {
      text: data.text,
      pages: data.numpages,
      metadata: {
        title: data.info?.Title,
        author: data.info?.Author,
        creationDate: data.info?.CreationDate,
        pageCount: data.numpages,
      },
    };
  } catch (err) {
    console.error('PDF extraction failed:', err);
    return {
      text: '',
      pages: 0,
      metadata: { pageCount: 0 },
    };
  }
}

export async function extractPDFFromFile(file: File): Promise<PDFExtractResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return extractTextFromPDF(buffer);
}
