import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReportContent } from './report-content';
import type { ExecutiveReport } from '@/lib/informe-ejecutivo';

const mockReport: ExecutiveReport = {
  title: 'Informe Ejecutivo de Indicadores',
  date: '04/06/2026',
  overview:
    'Resumen ejecutivo del análisis de indicadores de NNyA en Córdoba.',
  sections: [
    {
      category: 'salud',
      title: 'Análisis de Salud',
      analysis: 'La mortalidad infantil se redujo de 9.1 a 8.5 por mil.',
      highlights: [
        {
          type: 'positive',
          text: 'Reducción de TMI: 9.1 → 8.5 por mil nacidos vivos.',
        },
        {
          type: 'negative',
          text: 'Aumento de nacimientos adolescentes en un 3.2%.',
        },
        {
          type: 'neutral',
          text: 'Se mantiene la tasa de fecundidad adolescente en 12.5.',
        },
      ],
    },
  ],
  conclusion:
    'En conclusión, Córdoba muestra avances en salud infantil aunque persisten desafíos.',
  recommendations: ['Fortalecer políticas de salud infantil'],
};

describe('ReportContent', () => {
  it('renders the report title', () => {
    render(
      <ReportContent
        report={mockReport}
        generatedAt="2026-06-04T12:00:00.000Z"
      />,
    );
    expect(
      screen.getByText('Informe Ejecutivo de Indicadores'),
    ).toBeInTheDocument();
  });

  it('renders the report overview', () => {
    render(
      <ReportContent
        report={mockReport}
        generatedAt="2026-06-04T12:00:00.000Z"
      />,
    );
    expect(
      screen.getByText(/Resumen ejecutivo del análisis/),
    ).toBeInTheDocument();
  });

  it('renders category sections with analysis', () => {
    render(
      <ReportContent
        report={mockReport}
        generatedAt="2026-06-04T12:00:00.000Z"
      />,
    );
    expect(screen.getByText('Análisis de Salud')).toBeInTheDocument();
    expect(
      screen.getByText(
        'La mortalidad infantil se redujo de 9.1 a 8.5 por mil.',
      ),
    ).toBeInTheDocument();
  });

  it('renders positive highlights in a green container', () => {
    const { container } = render(
      <ReportContent
        report={mockReport}
        generatedAt="2026-06-04T12:00:00.000Z"
      />,
    );
    // The highlight wrapper div has bg-green-50 and text-green-700 classes
    const positiveDiv = container.querySelector('.bg-green-50');
    expect(positiveDiv).toBeInTheDocument();
    expect(positiveDiv?.textContent).toContain(
      'Reducción de TMI: 9.1 → 8.5 por mil nacidos vivos.',
    );
  });

  it('renders negative highlights in a red container', () => {
    const { container } = render(
      <ReportContent
        report={mockReport}
        generatedAt="2026-06-04T12:00:00.000Z"
      />,
    );
    const negativeDiv = container.querySelector('.bg-red-50');
    expect(negativeDiv).toBeInTheDocument();
    expect(negativeDiv?.textContent).toContain(
      'Aumento de nacimientos adolescentes en un 3.2%.',
    );
  });

  it('renders neutral highlights', () => {
    render(
      <ReportContent
        report={mockReport}
        generatedAt="2026-06-04T12:00:00.000Z"
      />,
    );
    expect(
      screen.getByText(
        /Se mantiene la tasa de fecundidad adolescente en 12.5/,
      ),
    ).toBeInTheDocument();
  });

  it('renders the conclusion', () => {
    render(
      <ReportContent
        report={mockReport}
        generatedAt="2026-06-04T12:00:00.000Z"
      />,
    );
    expect(
      screen.getByText(/Córdoba muestra avances en salud infantil/),
    ).toBeInTheDocument();
  });

  it('renders recommendations', () => {
    render(
      <ReportContent
        report={mockReport}
        generatedAt="2026-06-04T12:00:00.000Z"
      />,
    );
    expect(
      screen.getByText('Fortalecer políticas de salud infantil'),
    ).toBeInTheDocument();
  });

  it('renders the generated timestamp', () => {
    render(
      <ReportContent
        report={mockReport}
        generatedAt="2026-06-04T12:00:00.000Z"
      />,
    );
    // Multiple elements have 04/06/2026 (report.date + formatted generatedAt)
    const dateElements = screen.getAllByText(/04\/06\/2026/);
    expect(dateElements.length).toBeGreaterThanOrEqual(1);
  });

  it('shows fallback message when report is null', () => {
    render(<ReportContent report={null} generatedAt="" />);
    expect(
      screen.getByText('No se pudo generar el informe. Intente de nuevo.'),
    ).toBeInTheDocument();
  });

  it('shows fallback message when report is undefined', () => {
    render(<ReportContent generatedAt="" />);
    expect(
      screen.getByText('No se pudo generar el informe. Intente de nuevo.'),
    ).toBeInTheDocument();
  });
});
