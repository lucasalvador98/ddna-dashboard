import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ApisClient } from './apis-client';

describe('ApisClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the initial fetch failure and retries instead of rendering an empty success state', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ source: 'datos.gob.ar', datasets: ['salud-infantil'], total: 1 }),
      }),
    );

    render(<ApisClient initialData={null} initialError="No se pudo cargar el catálogo de datos." />);

    expect(screen.getByText('No se pudo cargar el catálogo de datos.')).toBeInTheDocument();
    expect(screen.queryByText('No se encontraron datasets')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));

    await waitFor(() => {
      expect(screen.getByText('salud-infantil')).toBeInTheDocument();
    });
  });
});
