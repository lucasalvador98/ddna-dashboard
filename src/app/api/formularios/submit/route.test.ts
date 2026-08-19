import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import type { Formulario } from '@/lib/formularios/types';

// ─── Mocks ──────────────────────────────────────────────────────
// The submit route uses service_role only to READ the definition (validate it)
// and an ANON client to INSERT — the RLS `INSERT TO anon WITH CHECK` policy is
// the enforcement backstop. We mock both clients; the real rate limiter is
// exercised (in-memory, unique keys per test).

let adminData: unknown = null;
let adminError: { message: string; code?: string } | null = null;
let insertError: { message: string; code?: string } | null = null;
let insertedPayload: unknown = null;

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: adminData, error: adminError }),
        }),
      }),
    }),
  }),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      insert: async (payload: unknown) => {
        insertedPayload = payload;
        return { data: null, error: insertError };
      },
    }),
  }),
}));

// ─── Fixtures ───────────────────────────────────────────────────

function makeForm(slug: string): Formulario {
  return {
    id: `form-${slug}`,
    slug,
    titulo: 'Encuesta 2026',
    descripcion: null,
    activo: true,
    created_at: '2026-08-11T00:00:00Z',
    updated_at: '2026-08-11T00:00:00Z',
    definicion: {
      version: 1,
      fields: [
        {
          id: 'provincia',
          type: 'select',
          label: 'Provincia',
          required: true,
          options: ['Córdoba', 'Buenos Aires'],
        },
        { id: 'municipio', type: 'text', label: 'Municipio', required: true },
        { id: 'edad', type: 'number', label: 'Edad', required: false },
      ],
      logic: [
        { field_id: 'provincia', op: 'eq', value: 'Córdoba', show_ids: ['municipio'] },
      ],
    },
  };
}

let slugCounter = 0;
function uniqueSlug(prefix: string): string {
  slugCounter += 1;
  return `${prefix}-${slugCounter}`;
}

function post(payload: unknown, ip = '1.2.3.4'): Promise<Response> {
  return POST(
    new Request('http://localhost:3000/api/formularios/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
      body: JSON.stringify(payload),
    }),
  );
}

// ─── Tests ──────────────────────────────────────────────────────

describe('POST /api/formularios/submit', () => {
  beforeEach(() => {
    adminData = null;
    adminError = null;
    insertError = null;
    insertedPayload = null;
  });

  it('inserts visible answers for an active form and returns 201', async () => {
    const slug = uniqueSlug('happy');
    adminData = makeForm(slug);

    const res = await post({ slug, respuestas: { provincia: 'Córdoba', municipio: 'La Calera' } });

    expect(res.status).toBe(201);
    expect(insertedPayload).toEqual({
      formulario_id: `form-${slug}`,
      respuestas: { provincia: 'Córdoba', municipio: 'La Calera' },
    });
  });

  it('strips answers of fields hidden by conditional logic', async () => {
    const slug = uniqueSlug('hidden');
    adminData = makeForm(slug);

    // municipio is only visible when provincia === 'Córdoba'.
    const res = await post({ slug, respuestas: { provincia: 'Buenos Aires', municipio: 'Zombie' } });

    expect(res.status).toBe(201);
    expect(insertedPayload).toEqual({
      formulario_id: `form-${slug}`,
      respuestas: { provincia: 'Buenos Aires' },
    });
  });

  it('strips unknown field ids and type-invalid values are rejected', async () => {
    const slug = uniqueSlug('unknown');
    adminData = makeForm(slug);

    const res = await post({
      slug,
      respuestas: { provincia: 'Córdoba', municipio: 'X', hacker: 'injected', edad: 'no-numero' },
    });

    expect(res.status).toBe(400);
    expect(insertedPayload).toBeNull();
  });

  it('rejects when a visible required field is missing', async () => {
    const slug = uniqueSlug('required');
    adminData = makeForm(slug);

    // provincia === 'Córdoba' reveals required municipio, left empty.
    const res = await post({ slug, respuestas: { provincia: 'Córdoba' } });

    expect(res.status).toBe(400);
    expect(insertedPayload).toBeNull();
  });

  it('returns 404 for an inactive form', async () => {
    const slug = uniqueSlug('inactive');
    adminData = { ...makeForm(slug), activo: false };

    const res = await post({ slug, respuestas: { provincia: 'Córdoba', municipio: 'X' } });

    expect(res.status).toBe(404);
    expect(insertedPayload).toBeNull();
  });

  it('returns 404 when the slug does not exist', async () => {
    const res = await post({ slug: 'no-existe', respuestas: { provincia: 'Córdoba' } });
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid JSON or malformed payloads', async () => {
    const raw = await POST(
      new Request('http://localhost:3000/api/formularios/submit', {
        method: 'POST',
        body: 'no-json',
      }),
    );
    expect(raw.status).toBe(400);

    const res = await post({ slug: 42, respuestas: [] });
    expect(res.status).toBe(400);
  });

  it('returns 400 when the payload exceeds the size cap', async () => {
    const big = 'x'.repeat(70_000);
    const res = await post({ slug: uniqueSlug('big'), respuestas: { provincia: big } });
    expect(res.status).toBe(400);
    expect(insertedPayload).toBeNull();
  });

  it('returns 400 when the RLS insert rejects (form deactivated meanwhile)', async () => {
    const slug = uniqueSlug('rls');
    adminData = makeForm(slug);
    insertError = { message: 'new row violates row-level security policy', code: '42501' };

    const res = await post({ slug, respuestas: { provincia: 'Córdoba', municipio: 'X' } });

    expect(res.status).toBe(400);
  });

  it('rate-limits the same ip+slug after 10 requests in the window', async () => {
    const slug = uniqueSlug('rate');
    adminData = makeForm(slug);

    let lastStatus = 0;
    for (let i = 0; i < 11; i += 1) {
      lastStatus = (await post({ slug, respuestas: { provincia: 'Córdoba', municipio: 'X' } }))
        .status;
    }

    expect(lastStatus).toBe(429);
  });
});
