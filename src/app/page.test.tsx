import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock section-card
vi.mock('@/components/section-card', () => ({
  SectionCard: ({ title }: { title: string }) => <div data-testid="section-card">{title}</div>,
}));

import HomePage from './page';

describe('HomePage — estructura limpia', () => {
  it('muestra el título del dashboard', () => {
    render(<HomePage />);
    expect(screen.getByText('Tablero de Monitoreo')).toBeInTheDocument();
  });

  it('muestra la descripción institucional', () => {
    render(<HomePage />);
    const matches = screen.getAllByText(/Defensoría de los Derechos de Niñas, Niños y Adolescentes/);
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it('muestra la sección "Explorar por tema"', () => {
    render(<HomePage />);
    expect(screen.getByText('Explorar por tema')).toBeInTheDocument();
  });

  it('muestra las 6 section cards', () => {
    render(<HomePage />);
    const cards = screen.getAllByTestId('section-card');
    expect(cards).toHaveLength(6);
  });

  it('las section cards incluyen Salud, Pobreza, Educación', () => {
    render(<HomePage />);
    expect(screen.getByText('Salud')).toBeInTheDocument();
    expect(screen.getByText('Pobreza')).toBeInTheDocument();
    expect(screen.getByText('Educación')).toBeInTheDocument();
  });

  it('muestra la sección "Herramientas"', () => {
    render(<HomePage />);
    expect(screen.getByText('Herramientas')).toBeInTheDocument();
  });

  it('muestra los 4 links de herramientas', () => {
    render(<HomePage />);
    expect(screen.getByText('Monitoreo de Medios')).toBeInTheDocument();
    expect(screen.getByText('Formularios')).toBeInTheDocument();
    expect(screen.getByText('Mapa Geo')).toBeInTheDocument();
    expect(screen.getByText('Chat Bibliografía')).toBeInTheDocument();
  });

  it('los links de herramientas apuntan a las rutas correctas', () => {
    render(<HomePage />);
    const monitoreoLink = screen.getByText('Monitoreo de Medios').closest('a');
    const formulariosLink = screen.getByText('Formularios').closest('a');
    const geoLink = screen.getByText('Mapa Geo').closest('a');
    const chatLink = screen.getByText('Chat Bibliografía').closest('a');

    expect(monitoreoLink?.getAttribute('href')).toBe('/monitoreo');
    expect(formulariosLink?.getAttribute('href')).toBe('/formularios');
    expect(geoLink?.getAttribute('href')).toBe('/geo');
    expect(chatLink?.getAttribute('href')).toBe('/repositorio/chat');
  });

  it('el footer muestra los logos institucionales', () => {
    render(<HomePage />);
    const logos = document.querySelectorAll('img');
    // Footer has 2 logo images
    const footerLogos = Array.from(logos).filter(
      img => img.getAttribute('src')?.includes('logos/')
    );
    expect(footerLogos.length).toBeGreaterThanOrEqual(2);
  });
});
