/**
 * XLSX Extractor - Extract text from Excel files
 * Reuses the xlsx library already in the project (ETL)
 */

import * as XLSX from 'xlsx';

export interface XLSXExtractResult {
  text: string;
  sheets: {
    name: string;
    rows: number;
    text: string;
  }[];
  sheetNames: string[];
}

/**
 * Extract text from XLSX buffer
 */
export function extractTextFromXLSX(buffer: Buffer): XLSXExtractResult {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    const sheets: XLSXExtractResult['sheets'] = [];
    let fullText = '';

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to text
      const sheetText = XLSX.utils.sheet_to_txt(worksheet, {
        FS: '\t', // Field separator
        RS: '\n', // Record separator
      });

      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      const rowCount = range.e.r - range.s.r + 1;

      sheets.push({
        name: sheetName,
        rows: rowCount,
        text: sheetText.trim(),
      });

      fullText += `--- Hoja: ${sheetName} ---\n${sheetText}\n\n`;
    }

    return {
      text: fullText.trim(),
      sheets,
      sheetNames: workbook.SheetNames,
    };
  } catch (error) {
    console.error("XLSX extraction error:", error);
    throw new Error(`Failed to extract XLSX: ${error}`);
  }
}

/**
 * Extract with JSON format (for structured data)
 */
export function extractJSONFromXLSX(buffer: Buffer): Record<string, any>[] {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    
    return XLSX.utils.sheet_to_json(firstSheet, {
      defval: '', // Default value for empty cells
      raw: false, // Convert values to strings/numbers
    }) as Record<string, any>[];
  } catch (error) {
    console.error("XLSX extraction error:", error);
    throw new Error(`Failed to extract XLSX: ${error}`);
  }
}

/**
 * Extract XLSX from File object (for client-side)
 */
export async function extractXLSXFromFile(file: File): Promise<XLSXExtractResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return extractTextFromXLSX(buffer);
}

/**
 * Convert XLSX data to readable text format
 */
export function formatXLSXData(data: Record<string, any>[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  let text = headers.join('\t') + '\n';
  
  for (const row of data) {
    const values = headers.map(h => String(row[h] || ''));
    text += values.join('\t') + '\n';
  }

  return text;
}
