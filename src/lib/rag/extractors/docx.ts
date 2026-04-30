/**
 * DOCX Extractor - Extract text from Word documents
 * Uses mammoth for server-side extraction
 */

import mammoth from "mammoth";

export interface DOCXExtractResult {
  text: string;
  html?: string;
  messages: string[];
}

/**
 * Extract text from DOCX buffer
 */
export async function extractTextFromDOCX(buffer: Buffer): Promise<DOCXExtractResult> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    
    return {
      text: result.value.trim(),
      messages: result.messages.map((m: any) => m.message),
    };
  } catch (error) {
    console.error("DOCX extraction error:", error);
    throw new Error(`Failed to extract DOCX: ${error}`);
  }
}

/**
 * Extract text with HTML formatting (optional)
 */
export async function extractDOCXWithHTML(buffer: Buffer): Promise<DOCXExtractResult> {
  try {
    const result = await mammoth.convertToHtml({ buffer });
    
    return {
      text: result.value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      html: result.value,
      messages: result.messages.map((m: any) => m.message),
    };
  } catch (error) {
    console.error("DOCX extraction error:", error);
    throw new Error(`Failed to extract DOCX: ${error}`);
  }
}

/**
 * Extract DOCX from File object (for client-side)
 */
export async function extractDOCXFromFile(file: File): Promise<DOCXExtractResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return extractTextFromDOCX(buffer);
}
