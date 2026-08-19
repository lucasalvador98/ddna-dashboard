import { describe, it, expect } from 'vitest';
import { slugify, isValidSlug } from './slug';

describe('slugify', () => {
  it('lowercases and replaces spaces with dashes', () => {
    expect(slugify('Encuesta 2026')).toBe('encuesta-2026');
  });

  it('strips diacritics', () => {
    expect(slugify('Relevamiento Infancia Córdoba')).toBe('relevamiento-infancia-cordoba');
  });

  it('removes non-alphanumeric characters', () => {
    expect(slugify('Salud y Educación: 2026!')).toBe('salud-y-educacion-2026');
  });

  it('collapses consecutive dashes', () => {
    expect(slugify('a  b   c')).toBe('a-b-c');
  });

  it('trims leading and trailing dashes', () => {
    expect(slugify('--hola--')).toBe('hola');
  });

  it('falls back to "formulario" for empty or symbol-only input', () => {
    expect(slugify('')).toBe('formulario');
    expect(slugify('  ')).toBe('formulario');
    expect(slugify('!!!')).toBe('formulario');
  });

  it('keeps valid slugs unchanged', () => {
    expect(slugify('encuesta-2026')).toBe('encuesta-2026');
  });
});

describe('isValidSlug', () => {
  it('accepts lowercase alphanumeric slugs with single dashes', () => {
    expect(isValidSlug('encuesta')).toBe(true);
    expect(isValidSlug('encuesta-2026')).toBe(true);
    expect(isValidSlug('a-b-c')).toBe(true);
  });

  it('rejects invalid slugs', () => {
    expect(isValidSlug('')).toBe(false);
    expect(isValidSlug('Encuesta')).toBe(false);
    expect(isValidSlug('encuesta-')).toBe(false);
    expect(isValidSlug('-encuesta')).toBe(false);
    expect(isValidSlug('encuesta--2026')).toBe(false);
    expect(isValidSlug('con espacio')).toBe(false);
    expect(isValidSlug('encuesta_2026')).toBe(false);
  });
});
