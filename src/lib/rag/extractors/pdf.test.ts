// @vitest-environment node
//
// A failed PDF extraction must not return a placeholder string: callers chunk
// and embed whatever text comes back, so a placeholder would be stored as if it
// were document content.

import { describe, expect, it, vi } from 'vitest';

vi.mock('pdf-parse', () => ({
  default: async () => ({ text: 'short', numpages: 1, info: {} }),
}));

import { extractTextFromPDF } from './pdf';

describe('extractTextFromPDF', () => {
  it('returns no indexable text when both extraction paths yield too little', async () => {
    // Under 50 characters, so rawExtract rejects it as non-text.
    const buffer = Buffer.from('%PDF-1.4 tiny fixture');

    const result = await extractTextFromPDF(buffer);

    expect(result.text).toBe('');
    expect(result.text.trim()).toHaveLength(0);
    expect(result.text).not.toContain('PDF extraction not available');
    expect(result.pages).toBe(0);
  });
});
