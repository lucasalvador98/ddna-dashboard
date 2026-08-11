import { describe, it, expect } from 'vitest';
import { validateDefinition, validateResponse } from './validation';
import type { CampoFormulario, DefinicionFormulario } from './types';

function validDefinition(): DefinicionFormulario {
  return {
    version: 1,
    fields: [
      { id: 'provincia', type: 'select', label: 'Provincia', required: true, options: ['Córdoba', 'Buenos Aires'] },
      { id: 'municipio', type: 'text', label: 'Municipio', required: true },
      { id: 'cantidad', type: 'number', label: 'Cantidad', required: false },
      { id: 'fecha', type: 'date', label: 'Fecha', required: false },
      { id: 'email', type: 'email', label: 'Email', required: false },
      { id: 'telefono', type: 'phone', label: 'Teléfono', required: false },
      { id: 'intereses', type: 'checkbox', label: 'Intereses', required: false, options: ['A', 'B', 'C'] },
      { id: 'nivel', type: 'radio', label: 'Nivel', required: false, options: ['Bajo', 'Alto'] },
      { id: 'puntaje', type: 'scale', label: 'Puntaje', required: false, min: 1, max: 5 },
      { id: 'titulo', type: 'heading', label: 'Sección', required: false },
    ],
    logic: [{ field_id: 'provincia', op: 'eq', value: 'Córdoba', show_ids: ['municipio'] }],
  };
}

describe('validateDefinition', () => {
  it('accepts a valid definition', () => {
    const result = validateDefinition(validDefinition());
    expect(result.valid).toBe(true);
  });

  it('rejects non-object definitions', () => {
    expect(validateDefinition(null).valid).toBe(false);
    expect(validateDefinition('nope').valid).toBe(false);
    expect(validateDefinition([]).valid).toBe(false);
  });

  it('rejects a wrong version', () => {
    const def = validDefinition() as unknown as Record<string, unknown>;
    def.version = 2;
    const result = validateDefinition(def);
    expect(result.valid).toBe(false);
  });

  it('rejects duplicate field ids', () => {
    const def = validDefinition();
    def.fields.push({ ...def.fields[0] });
    const result = validateDefinition(def);
    expect(result.valid).toBe(false);
    expect(result.errors.join()).toContain('duplicado');
  });

  it('rejects a rule whose field_id references a missing field', () => {
    const def = validDefinition();
    def.logic = [{ field_id: 'inexistente', op: 'eq', value: 'x', show_ids: ['municipio'] }];
    const result = validateDefinition(def);
    expect(result.valid).toBe(false);
    expect(result.errors.join()).toContain('no existe');
  });

  it('rejects a rule with a dangling show_ids target', () => {
    const def = validDefinition();
    def.logic = [{ field_id: 'provincia', op: 'eq', value: 'Córdoba', show_ids: ['fantasma'] }];
    const result = validateDefinition(def);
    expect(result.valid).toBe(false);
    expect(result.errors.join()).toContain('fantasma');
  });

  it('rejects a rule whose source field is not an option/scale type', () => {
    const def = validDefinition();
    def.logic = [{ field_id: 'cantidad', op: 'eq', value: 1, show_ids: ['municipio'] }];
    const result = validateDefinition(def);
    expect(result.valid).toBe(false);
    expect(result.errors.join()).toContain('opción o escala');
  });

  it('rejects more than MAX_FIELDS fields', () => {
    const def = validDefinition();
    def.fields = Array.from({ length: 101 }, (_, i) => ({
      id: `f${i}`,
      type: 'text' as const,
      label: `Campo ${i}`,
      required: false,
    }));
    const result = validateDefinition(def);
    expect(result.valid).toBe(false);
  });

  it('rejects more than MAX_RULES rules', () => {
    const def = validDefinition();
    def.logic = Array.from({ length: 51 }, () => ({
      field_id: 'provincia',
      op: 'eq' as const,
      value: 'Córdoba',
      show_ids: ['municipio'],
    }));
    const result = validateDefinition(def);
    expect(result.valid).toBe(false);
  });

  it('rejects a scale with min >= max', () => {
    const def = validDefinition();
    def.fields.push({ id: 'mal', type: 'scale', label: 'Mal', required: false, min: 5, max: 1 });
    const result = validateDefinition(def);
    expect(result.valid).toBe(false);
    expect(result.errors.join()).toContain('mínimo');
  });

  it('rejects empty options', () => {
    const def = validDefinition();
    def.fields.push({ id: 'vacio', type: 'select', label: 'Vacío', required: false, options: [] });
    const result = validateDefinition(def);
    expect(result.valid).toBe(false);
    expect(result.errors.join()).toContain('opción');
  });

  it('rejects a heading that is required', () => {
    const def = validDefinition();
    def.fields.push({ id: 'h2', type: 'heading', label: 'Sección', required: true } as unknown as CampoFormulario);
    const result = validateDefinition(def);
    expect(result.valid).toBe(false);
  });

  it('rejects an empty label', () => {
    const def = validDefinition();
    def.fields.push({ id: 'sinlabel', type: 'text', label: '  ', required: false });
    const result = validateDefinition(def);
    expect(result.valid).toBe(false);
    expect(result.errors.join()).toContain('etiqueta');
  });

  it('rejects a rule with an empty show_ids array', () => {
    const def = validDefinition();
    def.logic = [{ field_id: 'provincia', op: 'eq', value: 'Córdoba', show_ids: [] }];
    const result = validateDefinition(def);
    expect(result.valid).toBe(false);
  });
});

describe('validateResponse', () => {
  it('accepts a valid response and returns it cleaned', () => {
    const def = validDefinition();
    const answers = {
      provincia: 'Córdoba',
      municipio: 'Villa María',
      cantidad: 3,
      fecha: '2026-08-11',
      email: 'x@y.com',
      telefono: '351-555-1234',
      intereses: ['A', 'C'],
      nivel: 'Alto',
      puntaje: 4,
    };
    const result = validateResponse(def, answers);
    expect(result.valid).toBe(true);
    expect(result.answers).toEqual(answers);
  });

  it('strips values of fields hidden by logic', () => {
    const def = validDefinition();
    const result = validateResponse(def, { provincia: 'Buenos Aires', municipio: 'oculto' });
    expect(result.valid).toBe(true);
    expect(result.answers).toEqual({ provincia: 'Buenos Aires' });
  });

  it('strips unknown field ids', () => {
    const def = validDefinition();
    const result = validateResponse(def, { provincia: 'Córdoba', municipio: 'X', hacker: 'boom' });
    expect(result.valid).toBe(true);
    expect(result.answers).toEqual({ provincia: 'Córdoba', municipio: 'X' });
  });

  it('does not require a hidden required field', () => {
    const def = validDefinition();
    const result = validateResponse(def, { provincia: 'Buenos Aires' });
    expect(result.valid).toBe(true);
  });

  it('rejects a missing required visible field', () => {
    const def = validDefinition();
    const result = validateResponse(def, { provincia: 'Córdoba' });
    expect(result.valid).toBe(false);
    expect(result.errors.join()).toContain('obligatorio');
  });

  it('rejects an empty string on a required field', () => {
    const def = validDefinition();
    const result = validateResponse(def, { provincia: 'Córdoba', municipio: '' });
    expect(result.valid).toBe(false);
  });

  it('rejects a wrong type on a visible field', () => {
    const def = validDefinition();
    const result = validateResponse(def, {
      provincia: 'Córdoba',
      municipio: 'X',
      cantidad: 'no-es-numero',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.join()).toContain('número');
  });

  it('rejects an invalid date', () => {
    const def = validDefinition();
    const result = validateResponse(def, {
      provincia: 'Córdoba',
      municipio: 'X',
      fecha: '11/08/2026',
    });
    expect(result.valid).toBe(false);
  });

  it('rejects an invalid email', () => {
    const def = validDefinition();
    const result = validateResponse(def, {
      provincia: 'Córdoba',
      municipio: 'X',
      email: 'not-an-email',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.join()).toContain('email');
  });

  it('rejects a select value not in options', () => {
    const def = validDefinition();
    const result = validateResponse(def, {
      provincia: 'Mendoza',
      municipio: 'X',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.join()).toContain('opción');
  });

  it('rejects a checkbox value not in options', () => {
    const def = validDefinition();
    const result = validateResponse(def, {
      provincia: 'Córdoba',
      municipio: 'X',
      intereses: ['A', 'Z'],
    });
    expect(result.valid).toBe(false);
  });

  it('rejects a scale value out of range', () => {
    const def = validDefinition();
    const result = validateResponse(def, {
      provincia: 'Córdoba',
      municipio: 'X',
      puntaje: 9,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.join()).toContain('entre');
  });
});
