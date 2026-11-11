import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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

});
