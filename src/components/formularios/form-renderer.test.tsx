import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormRenderer } from './form-renderer';
import type { DefinicionFormulario } from '@/lib/formularios/types';

const BASE_DEF: DefinicionFormulario = {
  version: 1,
  fields: [
    { id: 'nombre', type: 'text', label: 'Nombre', required: true },
    { id: 'detalle', type: 'textarea', label: 'Detalle', required: false },
    { id: 'edad', type: 'number', label: 'Edad', required: false },
    { id: 'nacimiento', type: 'date', label: 'Nacimiento', required: false },
    { id: 'provincia', type: 'select', label: 'Provincia', required: true, options: ['Córdoba', 'Buenos Aires'] },
    { id: 'genero', type: 'radio', label: 'Género', required: false, options: ['Femenino', 'Masculino'] },
    { id: 'intereses', type: 'checkbox', label: 'Intereses', required: false, options: ['Deportes', 'Música'] },
    { id: 'nivel', type: 'scale', label: 'Nivel', required: false, min: 1, max: 5 },
    { id: 'mail', type: 'email', label: 'Email', required: false },
    { id: 'tel', type: 'phone', label: 'Teléfono', required: false },
    { id: 'titulo', type: 'heading', label: 'Encabezado', required: false },
  ],
  logic: [],
};

function makeDef(overrides: Partial<DefinicionFormulario> = {}): DefinicionFormulario {
  return { ...BASE_DEF, ...overrides };
}

describe('FormRenderer', () => {
  it('renders the form title, description and every field label', () => {
    render(
      <FormRenderer definicion={makeDef()} titulo="Encuesta 2026" descripcion="Relevamiento anual" />,
    );
    expect(screen.getByText('Encuesta 2026')).toBeInTheDocument();
    expect(screen.getByText('Relevamiento anual')).toBeInTheDocument();
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Provincia')).toBeInTheDocument();
    expect(screen.getByText('Encabezado')).toBeInTheDocument();
  });

  it('renders inputs per field type', () => {
    render(<FormRenderer definicion={makeDef()} titulo="T" />);
    expect(screen.getByLabelText(/Nombre/)).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText(/Detalle/).tagName).toBe('TEXTAREA');
    expect(screen.getByLabelText(/Edad/)).toHaveAttribute('type', 'number');
    expect(screen.getByLabelText(/Nacimiento/)).toHaveAttribute('type', 'date');
    expect(screen.getByLabelText(/Provincia/).tagName).toBe('SELECT');
    expect(screen.getByLabelText(/Email/)).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText(/Teléfono/)).toHaveAttribute('type', 'tel');
    expect(screen.getByRole('radio', { name: 'Femenino' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Deportes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
  });

  it('reveals a conditional field when its source matches (spec scenario 1)', () => {
    const def = makeDef({
      fields: [
        { id: 'provincia', type: 'select', label: 'Provincia', required: true, options: ['Córdoba', 'Buenos Aires'] },
        { id: 'municipio', type: 'text', label: 'Municipio', required: false },
      ],
      logic: [{ field_id: 'provincia', op: 'eq', value: 'Córdoba', show_ids: ['municipio'] }],
    });

    render(<FormRenderer definicion={def} titulo="T" />);
    expect(screen.queryByLabelText('Municipio')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Provincia/), { target: { value: 'Córdoba' } });
    expect(screen.getByLabelText(/Municipio/)).toBeInTheDocument();
  });

  it('hides a conditional field again when the source no longer matches', () => {
    const def = makeDef({
      fields: [
        { id: 'provincia', type: 'select', label: 'Provincia', required: true, options: ['Córdoba', 'Buenos Aires'] },
        { id: 'municipio', type: 'text', label: 'Municipio', required: false },
      ],
      logic: [{ field_id: 'provincia', op: 'eq', value: 'Córdoba', show_ids: ['municipio'] }],
    });

    render(<FormRenderer definicion={def} titulo="T" />);
    fireEvent.change(screen.getByLabelText(/Provincia/), { target: { value: 'Córdoba' } });
    expect(screen.getByLabelText(/Municipio/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Provincia/), { target: { value: 'Buenos Aires' } });
    expect(screen.queryByLabelText('Municipio')).not.toBeInTheDocument();
  });

  it('does not render a submit button in preview mode', () => {
    render(<FormRenderer definicion={makeDef()} titulo="T" preview />);
    expect(screen.queryByRole('button', { name: /Enviar/ })).not.toBeInTheDocument();
  });

  it('shows "Campo obligatorio" for an empty required field on submit and skips onSubmit', async () => {
    const onSubmit = vi.fn();
    render(<FormRenderer definicion={makeDef()} titulo="T" onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(screen.getAllByText('Campo obligatorio').length).toBeGreaterThan(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with the answers when required fields are filled', async () => {
    const onSubmit = vi.fn();
    const def = makeDef({
      fields: [
        { id: 'nombre', type: 'text', label: 'Nombre', required: true },
        { id: 'provincia', type: 'select', label: 'Provincia', required: true, options: ['Córdoba', 'Buenos Aires'] },
      ],
      logic: [],
    });

    render(<FormRenderer definicion={def} titulo="T" onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/Nombre/), { target: { value: 'Luca' } });
    fireEvent.change(screen.getByLabelText(/Provincia/), { target: { value: 'Córdoba' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(onSubmit).toHaveBeenCalledWith({ nombre: 'Luca', provincia: 'Córdoba' });
  });

  it('reports an invalid email without calling onSubmit', async () => {
    const onSubmit = vi.fn();
    const def = makeDef({
      fields: [
        { id: 'mail', type: 'email', label: 'Email', required: false },
      ],
      logic: [],
    });

    render(<FormRenderer definicion={def} titulo="T" onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'no-es-email' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(screen.getByText('Ingresá un email válido')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('captures a checkbox as an array of options', async () => {
    const onSubmit = vi.fn();
    const def = makeDef({
      fields: [{ id: 'intereses', type: 'checkbox', label: 'Intereses', required: false, options: ['Deportes', 'Música'] }],
      logic: [],
    });

    render(<FormRenderer definicion={def} titulo="T" onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Deportes' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Música' }));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(onSubmit).toHaveBeenCalledWith({ intereses: ['Deportes', 'Música'] });
  });

  it('captures a scale selection as a number', async () => {
    const onSubmit = vi.fn();
    const def = makeDef({
      fields: [{ id: 'nivel', type: 'scale', label: 'Nivel', required: false, min: 1, max: 5 }],
      logic: [],
    });

    render(<FormRenderer definicion={def} titulo="T" onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: '4' }));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(onSubmit).toHaveBeenCalledWith({ nivel: 4 });
  });
});
