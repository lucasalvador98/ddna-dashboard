import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResponsesTable } from './responses-table';
import type { DefinicionFormulario, FormularioRespuesta } from '@/lib/formularios/types';

// Production definitions keep the top-level `fields` array EMPTY and store
// every field inside `bloques[*].fields` — the regression this covers.
const BLOCKED_DEF: DefinicionFormulario = {
  version: 1,
  fields: [],
  logic: [],
  bloques: [
    {
      id: 'b1',
      titulo: 'Datos personales',
      fields: [
        { id: 'nombre', type: 'text', label: 'Nombre', required: true },
        { id: 'edad', type: 'number', label: 'Edad', required: false },
        { id: 'enc', type: 'heading', label: 'Encabezado', required: false },
        { id: 'provincia', type: 'select', label: 'Provincia', required: false, options: ['Córdoba'] },
        { id: 'intereses', type: 'checkbox', label: 'Intereses', required: false, options: ['Deportes', 'Música'] },
        { id: 'descarte', type: 'text', label: 'Descarte', required: false },
      ],
    },
  ],
};

const RESPUESTAS: FormularioRespuesta[] = [
  {
    id: 'r1',
    formulario_id: 'f1',
    respuestas: { nombre: 'Ana', intereses: ['Deportes', 'Música'] },
    submitted_at: '2026-08-11T13:00:00Z',
  },
  {
    id: 'r2',
    formulario_id: 'f1',
    respuestas: { nombre: { raw: 'object' }, provincia: 'Córdoba' },
    submitted_at: '2026-08-10T10:00:00Z',
  },
];

function renderTable() {
  return render(
    <ResponsesTable
      respuestas={RESPUESTAS}
      definicion={BLOCKED_DEF}
      busyId={null}
      onView={vi.fn()}
      onDelete={vi.fn()}
    />
  );
}

describe('ResponsesTable', () => {
  it('renders preview columns from bloques when top-level fields are empty', () => {
    renderTable();

    // First 4 answerable fields inside the block (heading excluded)
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Edad')).toBeInTheDocument();
    expect(screen.getByText('Provincia')).toBeInTheDocument();
    expect(screen.getByText('Intereses')).toBeInTheDocument();
    // Beyond the PREVIEW_FIELDS slice / non-answerable
    expect(screen.queryByText('Descarte')).not.toBeInTheDocument();
    expect(screen.queryByText('Encabezado')).not.toBeInTheDocument();

    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('Deportes, Música')).toBeInTheDocument();
  });

  it('never renders object answers as [object Object]', () => {
    renderTable();

    expect(screen.queryByText('[object Object]')).not.toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });
});
