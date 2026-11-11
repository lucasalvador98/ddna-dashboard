import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(resolve(process.cwd(), 'src/app/fuentes/page.tsx'), 'utf8');

describe('fuentes initial data state', () => {
  it('does not substitute hardcoded examples when the database read fails', () => {
    expect(pageSource).not.toContain('fallbackFuentes');
    expect(pageSource).toContain('fuentes: []');
    expect(pageSource).toContain("error: 'Error al cargar las fuentes de datos.'");
  });
});
