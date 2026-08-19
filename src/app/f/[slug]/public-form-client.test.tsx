import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PublicFormClient } from './public-form-client';
import type { DefinicionFormulario } from '@/lib/formularios/types';

const DEF: DefinicionFormulario = {
  version: 1,
  fields: [{ id: 'nombre', type: 'text', label: 'Nombre', required: true }],
  logic: [],
};

function okResponse() {
  return { ok: true, status: 201, json: async () => ({ ok: true }) };
}

function fillAndSubmit() {
  fireEvent.change(screen.getByLabelText(/Nombre/), { target: { value: 'Ana' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));
}

describe('PublicFormClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the form title, description and field inputs', () => {
    render(
      <PublicFormClient
        slug="encuesta-2026"
        titulo="Encuesta 2026"
        descripcion="Relevamiento anual"
        definicion={DEF}
      />,
    );

    expect(screen.getByText('Encuesta 2026')).toBeInTheDocument();
    expect(screen.getByText('Relevamiento anual')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument();
  });

  it('shows the confirmation screen after a successful submit', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse()));

    render(<PublicFormClient slug="encuesta-2026" titulo="T" descripcion={null} definicion={DEF} />);
    fillAndSubmit();

    expect(await screen.findByText('¡Gracias por responder!')).toBeInTheDocument();
  });

  it('posts the slug and answers to the submit route', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', fetchMock);

    render(<PublicFormClient slug="encuesta-2026" titulo="T" descripcion={null} definicion={DEF} />);
    fillAndSubmit();
    await screen.findByText('¡Gracias por responder!');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/formularios/submit',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: 'encuesta-2026', respuestas: { nombre: 'Ana' } }),
      }),
    );
  });

  it('shows the rate-limit message on a 429 response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({ error: 'x' }) }),
    );

    render(<PublicFormClient slug="encuesta-2026" titulo="T" descripcion={null} definicion={DEF} />);
    fillAndSubmit();

    expect(
      await screen.findByText('Demasiadas solicitudes. Intentá de nuevo en unos minutos.'),
    ).toBeInTheDocument();
  });

  it('shows the server error message on a 400 response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Algunos campos no son válidos.' }),
      }),
    );

    render(<PublicFormClient slug="encuesta-2026" titulo="T" descripcion={null} definicion={DEF} />);
    fillAndSubmit();

    expect(await screen.findByText('Algunos campos no son válidos.')).toBeInTheDocument();
  });

  it('shows a fallback message when the request itself fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));

    render(<PublicFormClient slug="encuesta-2026" titulo="T" descripcion={null} definicion={DEF} />);
    fillAndSubmit();

    expect(await screen.findByText(/No se pudo enviar la respuesta/)).toBeInTheDocument();
  });
});
