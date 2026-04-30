/**
 * PDF Extractor - Extract text from PDF files
 * Uses pdfjs-dist for client-side or API for server-side
 * 
 * NOTE: For server-side usage in Next.js API routes, we use pdfjs-dist
 * which works in Node.js environment
 */

import * as pdfjs from "pdfjs-dist";

// Configure worker for Node.js environment
if (typeof window === 'undefined') {
  // Server-side: configure worker
  pdfjs.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.entry.js');
}

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
    // Load PDF from buffer
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(buffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    let fullText = "";

    // Extract text from each page
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      
      fullText += `--- Página ${i} ---\n${pageText}\n\n`;
    }

    // Get metadata
    const metadata = await pdf.getMetadata().catch(() => null);
    const info = (metadata as any)?.info || {};

    return {
      text: fullText.trim(),
      pages: numPages,
      metadata: {
        title: info.Title || undefined,
        author: info.Author || undefined,
        creationDate: info.CreationDate || undefined,
        pageCount: numPages,
      },
    };
  } catch (error) {
    console.error("PDF extraction error:", error);
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
