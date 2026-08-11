import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteRespuesta, exportRespuestasCsv, type CsvExportResult } from './formularios';
import { listRespuestas } from '@/lib/formularios/queries';
import { assertAdminAuth } from './assert-admin';
import type { DefinicionFormulario, FormularioRespuesta } from '@/lib/formularios/types';

// ─── Mocks ──────────────────────────────────────────────────────
// The responses admin actions/queries use the service_role client only; the
// RLS admin policies are defense in depth. We mock getSupabaseAdminClient and
// the shared guard, and exercise the real delete/export/query logic.

let rows: unknown[] = [];
let singleRow: unknown = null;
let queryError: { message: string } | null = null;

vi.mock('@/lib/actions/assert-admin', () => ({
  assertAdminAuth: vi.fn(async () => undefined),
}));
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));
vi.mock('@/lib/supabase', () => ({
  getSupabaseAdminClient: () => ({
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: singleRow, error: queryError }),
          order: () => ({
            limit: async () => ({ data: rows, error: queryError }),
          }),
        }),
      }),
      delete: () => ({
        eq: async () => ({ data: null, error: queryError }),
      }),
    }),
  }),
}));

const DEF: DefinicionFormulario = {
  version: 1,
  fields: [
    { id: 'nombre', type: 'text', label: 'Nombre', required: true },
    { id: 'edad', type: 'number', label: 'Edad', required: false },
  ],
  logic: [],
};

const RESPUESTA: FormularioRespuesta = {
  id: 'r1',
  formulario_id: 'f1',
  respuestas: { nombre: 'Ana', edad: 12 },
  submitted_at: '2026-08-11T13:00:00Z',
};

function expectCsv(result: CsvExportResult): string {
  if (!result.ok) throw new Error(result.error);
  return result.csv;
}

describe('listRespuestas', () => {
  beforeEach(() => {
    rows = [];
    singleRow = null;
    queryError = null;
  });

  it('returns the rows for the form', async () => {
    rows = [RESPUESTA];
    const result = await listRespuestas('f1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('r1');
  });

  it('returns an empty array when there are no responses', async () => {
    const result = await listRespuestas('f1');
    expect(result).toEqual([]);
  });

  it('throws on a database error', async () => {
    queryError = { message: 'boom' };
    await expect(listRespuestas('f1')).rejects.toThrow('boom');
  });
});

describe('deleteRespuesta', () => {
  beforeEach(() => {
    queryError = null;
    vi.clearAllMocks();
  });

  it('guards with assertAdminAuth and returns ok on success', async () => {
    const result = await deleteRespuesta('r1');
    expect(result).toEqual({ ok: true });
    expect(assertAdminAuth).toHaveBeenCalledTimes(1);
  });

  it('returns an error result on failure', async () => {
    queryError = { message: 'boom' };
    const result = await deleteRespuesta('r1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('boom');
  });
});

describe('exportRespuestasCsv', () => {
  beforeEach(() => {
    rows = [];
    singleRow = null;
    queryError = null;
    vi.clearAllMocks();
  });

  it('builds the CSV with field labels plus submitted_at', async () => {
    singleRow = { definicion: DEF };
    rows = [RESPUESTA];

    const result = await exportRespuestasCsv('f1');
    const body = expectCsv(result).replace('\uFEFF', '');

    expect(body.split('\r\n')[0]).toBe('Nombre;Edad;submitted_at');
    expect(body.split('\r\n')[1]).toBe('Ana;12;2026-08-11T13:00:00Z');
    expect(assertAdminAuth).toHaveBeenCalledTimes(1);
  });

  it('returns an error when the form does not exist', async () => {
    const result = await exportRespuestasCsv('f1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('El formulario no existe.');
  });
});
