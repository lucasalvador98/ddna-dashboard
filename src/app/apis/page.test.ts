import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(resolve(process.cwd(), 'src/app/apis/page.tsx'), 'utf8');

describe('APIs initial data state', () => {
  it('passes a failed catalogue request to the client as an error, not an empty dataset list', () => {
    expect(pageSource).toContain('initialError');
    expect(pageSource).not.toContain('datasets: []');
  });
});
