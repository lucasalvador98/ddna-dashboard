import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormulariosClient } from './formularios-client';
import type { Formulario } from '@/lib/formularios/types';

vi.mock('@/lib/actions/formularios', () => ({
  deleteForm: vi.fn(async () => ({ ok: true })),
  toggleForm: vi.fn(async () => ({ ok: true })),
}));

vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(async () => 'data:image/png;base64,FAKE_QR'),
  },
}));

const FORMS: Formulario[] = [
  {
    id: 'f1',
    slug: 'encuesta-2026',
    titulo: 'Encuesta 2026',
    descripcion: null,
    activo: true,
    created_at: '2026-08-11T00:00:00Z',
    updated_at: '2026-08-11T00:00:00Z',
    definicion: {
      version: 1,
      fields: [{ id: 'nombre', type: 'text', label: 'Nombre', required: true }],
      logic: [],
    },
  },
];

const PUBLIC_URL = `${window.location.origin}/f/encuesta-2026`;

function stubClipboard() {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: vi.fn(async () => undefined) },
    configurable: true,
  });
}

describe('FormulariosClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubClipboard();
  });

  it('renders the form title and all action buttons', () => {
    render(<FormulariosClient formularios={FORMS} />);

    expect(screen.getByText('Encuesta 2026')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Editar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Compartir' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Respuestas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Borrar' })).toBeInTheDocument();
  });

  it('copies the public form link to the clipboard via the share modal', async () => {
    render(<FormulariosClient formularios={FORMS} />);

    fireEvent.click(screen.getByRole('button', { name: 'Compartir' }));
    fireEvent.click(screen.getByRole('button', { name: 'Copiar link' }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(PUBLIC_URL);
    expect(await screen.findByText('Link copiado al portapapeles.')).toBeInTheDocument();
  });

  it('opens the share modal with the public link when clicking "Compartir"', () => {
    render(<FormulariosClient formularios={FORMS} />);

    fireEvent.click(screen.getByRole('button', { name: 'Compartir' }));

    expect(screen.getByRole('dialog', { name: 'Compartí este formulario' })).toBeInTheDocument();
    expect(screen.getByText(PUBLIC_URL)).toBeInTheDocument();
  });

  it('renders the generated QR image and the download action', async () => {
    render(<FormulariosClient formularios={FORMS} />);

    fireEvent.click(screen.getByRole('button', { name: 'Compartir' }));

    const img = await screen.findByAltText('Código QR para Encuesta 2026');
    expect(img).toHaveAttribute('src', 'data:image/png;base64,FAKE_QR');

    const download = screen.getByRole('link', { name: 'Descargar QR' });
    expect(download).toHaveAttribute('download', 'formulario-encuesta-2026-qr.png');
    expect(download).toHaveAttribute('href', 'data:image/png;base64,FAKE_QR');
  });

  it('closes the share modal with the Escape key', async () => {
    render(<FormulariosClient formularios={FORMS} />);

    fireEvent.click(screen.getByRole('button', { name: 'Compartir' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows an error state when QR generation fails', async () => {
    const qrcodeModule = await import('qrcode');
    vi.mocked(qrcodeModule.default.toDataURL).mockRejectedValueOnce(new Error('boom'));

    render(<FormulariosClient formularios={FORMS} />);

    fireEvent.click(screen.getByRole('button', { name: 'Compartir' }));

    expect(await screen.findByText('No se pudo generar el código QR.')).toBeInTheDocument();
  });
});
