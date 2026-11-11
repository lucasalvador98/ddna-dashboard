import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FuentesClient } from './fuentes-client';

describe('FuentesClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows a failed catalogue read without presenting example sources as live data', () => {
    render(
      <FuentesClient
        initialFuentes={[]}
        initialError="Error al cargar las fuentes de datos."
        initialLastFetch="2026-11-11T00:00:00.000Z"
      />,
    );

    expect(screen.getByText('Error al cargar las fuentes de datos.')).toBeInTheDocument();
    expect(screen.queryByText('Conectado a Supabase — Datos en vivo')).not.toBeInTheDocument();
    expect(screen.queryByText('Ministerio de Salud de Córdoba')).not.toBeInTheDocument();
  });

  it('renders one external-APIs panel instead of duplicate source controls', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ source: 'datos.gob.ar', datasets: [], total: 0 }),
      }),
    );

    render(
      <FuentesClient
        initialFuentes={[]}
        initialError={null}
        initialLastFetch="2026-11-11T00:00:00.000Z"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'APIs Externas' }));

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Datos Argentina (Nacional)' })).toHaveLength(1);
    });
  });
});
