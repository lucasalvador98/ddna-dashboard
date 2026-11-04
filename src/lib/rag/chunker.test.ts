import { describe, expect, it } from 'vitest';
import { chunkText, sanitizeText } from './chunker';

// Postgres rejects U+0000 in text and PostgREST surfaces it as the opaque
// "unsupported Unicode escape sequence". PDF extraction emits it wherever a
// ligature could not be decoded, and one byte fails an entire chunk insert —
// two documents were emptied this way on 2026-11-04.
describe('sanitizeText', () => {
  it('removes NUL and other control characters', () => {
    const raw = 'signi\u0000cativa el \u0000n de\u0001l per\u00edodo\u007f';

    expect(sanitizeText(raw)).toBe('signicativa el n del período');
  });

  it('keeps tabs and newlines so paragraph structure survives', () => {
    expect(sanitizeText('uno\tdos\ntres\r\ncuatro')).toBe('uno\tdos\ntres\r\ncuatro');
  });

  it('leaves accented text untouched', () => {
    expect(sanitizeText('inversión social — niñez')).toBe('inversión social — niñez');
  });
});

describe('chunkText', () => {
  it('never emits a control character into a chunk', () => {
    const text = `${'palabra '.repeat(300)}\u0000${'otra '.repeat(300)}`;

    const chunks = chunkText(text);

    expect(chunks.length).toBeGreaterThan(0);
    for (const chunk of chunks) {
      expect(chunk.content).not.toMatch(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/);
    }
  });
});
