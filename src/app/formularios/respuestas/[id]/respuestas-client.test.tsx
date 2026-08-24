import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RespuestasClient } from './respuestas-client';
import { deleteRespuesta, exportRespuestasXlsx } from '@/lib/actions/formularios';
import type { Formulario, FormularioRespuesta } from '@/lib/formularios/types';

vi.mock('@/lib/actions/formularios', () => ({
  deleteRespuesta: vi.fn(async () => ({ ok: true })),
  exportRespuestasXlsx: vi.fn(async () => ({
    ok: true,
    buffer: new ArrayBuffer(0),
  })),
}));

const FORM: Formulario = {
  id: 'f1',
  slug: 'encuesta-2026',
  titulo: 'Encuesta 2026',
  descripcion: null,
  activo: true,
  created_at: '2026-08-11T00:00:00Z',
  updated_at: '2026-08-11T00:00:00Z',
  definicion: {
    version: 1,
    fields: [
      { id: 'nombre', type: 'text', label: 'Nombre', required: true },
      { id: 'edad', type: 'number', label: 'Edad', required: false },
    ],
    logic: [],
  },
};

const RESPUESTAS: FormularioRespuesta[] = [
  { id: 'r1', formulario_id: 'f1', respuestas: { nombre: 'Ana', edad: 12 }, submitted_at: '2026-08-11T13:00:00Z' },
  { id: 'r2', formulario_id: 'f1', respuestas: { nombre: 'Lucas' }, submitted_at: '2026-08-10T10:00:00Z' },
];

function stubBlobUrls() {
  Object.defineProperty(URL, 'createObjectURL', {
    value: vi.fn(() => 'blob:test'),
    configurable: true,
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    value: vi.fn(),
    configurable: true,
  });
}

describe('RespuestasClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubBlobUrls();
  });

  it('renders the form title, response count and table rows', () => {
    render(<RespuestasClient form={FORM} respuestas={RESPUESTAS} />);

    expect(screen.getByText('Encuesta 2026')).toBeInTheDocument();
    expect(screen.getByText(/2 respuestas/)).toBeInTheDocument();
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('Lucas')).toBeInTheDocument();
  });

  it('shows an empty state when there are no responses', () => {
    render(<RespuestasClient form={FORM} respuestas={[]} />);

    expect(screen.getByText('Todavía no hay respuestas para este formulario.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exportar XLSX' })).toBeDisabled();
  });

  it('shows the not-found state when the form is missing', () => {
    render(<RespuestasClient form={null} respuestas={[]} />);

    expect(screen.getByText('Formulario no encontrado.')).toBeInTheDocument();
  });

  it('opens the detail drawer with the pretty JSON on "Ver detalle"', () => {
    render(<RespuestasClient form={FORM} respuestas={RESPUESTAS} />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Ver detalle' })[0]);

    expect(screen.getByRole('dialog', { name: 'Detalle de la respuesta' })).toBeInTheDocument();
    expect(screen.getByText(/\"nombre\": \"Ana\"/)).toBeInTheDocument();
  });

  it('deletes a response after confirmation and removes the row', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<RespuestasClient form={FORM} respuestas={RESPUESTAS} />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Borrar respuesta' })[0]);

    expect(await screen.findByText('Respuesta eliminada.')).toBeInTheDocument();
    expect(deleteRespuesta).toHaveBeenCalledWith('r1');
    expect(screen.queryByText('Ana')).not.toBeInTheDocument();
    expect(screen.getByText(/1 respuesta/)).toBeInTheDocument();
  });

  it('keeps the row when the delete confirmation is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<RespuestasClient form={FORM} respuestas={RESPUESTAS} />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Borrar respuesta' })[0]);

    expect(deleteRespuesta).not.toHaveBeenCalled();
    expect(screen.getByText('Ana')).toBeInTheDocument();
  });

  it('exports the XLSX through the server action and downloads a Blob', async () => {
    render(<RespuestasClient form={FORM} respuestas={RESPUESTAS} />);

    fireEvent.click(screen.getByRole('button', { name: 'Exportar XLSX' }));

    expect(await screen.findByText('Archivo XLSX descargado.')).toBeInTheDocument();
    expect(exportRespuestasXlsx).toHaveBeenCalledWith('f1');
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  });
});
