import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(resolve(process.cwd(), 'src/app/admin/page.tsx'), 'utf8');

describe('admin dashboard KPI labels', () => {
  it('labels the count from grupos_indicadores as groups, not users', () => {
    expect(pageSource).toContain(".from('grupos_indicadores').select('id', { count: 'exact', head: true })");
    expect(pageSource).toContain('title="Grupos de indicadores"');
    expect(pageSource).not.toContain('title="Usuarios del sistema"');
  });
});
