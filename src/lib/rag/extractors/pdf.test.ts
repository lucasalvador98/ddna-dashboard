// @vitest-environment node
//
// pdf-parse 2.x exports the `PDFParse` class; `mod.default` is undefined. The
// extractor used to look up `mod.default`, always got null, and fell through to
// a raw-bytes path that indexed the PDF's binary streams as text. These tests
// pin the class-based API so that regression cannot come back silently.

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetText, mockDestroy, mockConstructor } = vi.hoisted(() => ({
  mockGetText: vi.fn(),
  mockDestroy: vi.fn(),
  mockConstructor: vi.fn(),
}));

vi.mock('pdf-parse', () => ({
  PDFParse: class {
    constructor(options: unknown) {
      mockConstructor(options);
    }
    getText() {
      return mockGetText();
    }
    destroy() {
      return mockDestroy();
    }
  },
}));

import { extractTextFromPDF } from './pdf';

/** Real text is longer than the minimum useful extraction length. */
const REAL_TEXT =
  'Consumos adolescentes: nuevas racionalidades (des) integrativas y estrategias de la diferencia.';

describe('extractTextFromPDF', () => {
  beforeEach(() => {
    mockGetText.mockReset();
    mockDestroy.mockReset();
    mockConstructor.mockReset();
    mockDestroy.mockResolvedValue(undefined);
  });

  it('extracts text through the PDFParse class', async () => {
    mockGetText.mockResolvedValue({
      text: REAL_TEXT,
      pages: [
        { num: 1, text: 'uno' },
        { num: 2, text: 'dos' },
      ],
    });

    const result = await extractTextFromPDF(Buffer.from('%PDF-1.6 fixture'));

    expect(result.text).toContain('Consumos adolescentes');
    expect(result.pages).toBe(2);
    expect(mockConstructor).toHaveBeenCalledTimes(1);
    expect(mockDestroy).toHaveBeenCalledTimes(1);
  });

  it('returns no indexable text when parsing fails', async () => {
    mockGetText.mockRejectedValue(new Error('InvalidPDFException'));

    const result = await extractTextFromPDF(Buffer.from('%PDF-1.6 not really a pdf'));

    expect(result.text).toBe('');
    expect(result.pages).toBe(0);
    // The parser still has to be released even when it throws.
    expect(mockDestroy).toHaveBeenCalledTimes(1);
  });

  it('does not index a stub extraction shorter than the minimum', async () => {
    mockGetText.mockResolvedValue({ text: 'short', pages: [{ num: 1, text: 'short' }] });

    const result = await extractTextFromPDF(Buffer.from('%PDF-1.6 tiny'));

    expect(result.text).toBe('');
    expect(result.pages).toBe(0);
  });
});
