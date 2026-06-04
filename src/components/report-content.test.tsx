import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReportContent } from './report-content';
import type { ExecutiveReport, CriticalReport } from '@/lib/informe-ejecutivo';

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

const criticalReport: CriticalReport = {
  ...mockReport,
  dataQuality: [
    { category: 'salud', rating: 'alta', issues: ['Datos actualizados a 2022'] },
    { category: 'pobreza', rating: 'baja', issues: ['Datos desactualizados desde 2021', 'Fuente no verificada'] },
  ],
  discrepancies: [
    { description: 'El indicador de TMI muestra 8.5 pero documento de MSAL indica 9.1', sources: ['indicador', 'documento'], severity: 'alta' },
    { description: 'Diferencia menor en tasa de fecundidad adolescente', sources: ['indicador', 'web'], severity: 'baja' },
  ],
  crossReferences: [
    { source: 'documento', title: 'Informe MSAL 2022', content: 'La mortalidad infantil en Córdoba se redujo...', relevance: 'Confirma tendencia del indicador' },
    { source: 'web', title: 'UNICEF Argentina', content: 'Datos nacionales de niñez y adolescencia', relevance: 'Contexto nacional de referencia' },
  ],
  suggestedImprovements: [
    'Actualizar fuente de datos de MSAL a 2024',
    'Agregar desglose por género en indicadores de salud',
  ],
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

  // ── Critical Report Section Tests ─────────────────────────────

  it('renders data quality section with badges', () => {
    render(<ReportContent report={criticalReport} />);
    expect(
      screen.getByText('Calidad de Datos por Categoría'),
    ).toBeInTheDocument();
    expect(screen.getByText('Alta')).toBeInTheDocument();
    expect(screen.getByText('Baja')).toBeInTheDocument();
    expect(
      screen.getByText('Datos actualizados a 2022'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Datos desactualizados desde 2021'),
    ).toBeInTheDocument();
  });

  it('renders data quality with green bg for alta rating', () => {
    const { container } = render(<ReportContent report={criticalReport} />);
    const altaBadge = container.querySelector('.bg-green-100');
    expect(altaBadge).toBeInTheDocument();
    expect(altaBadge?.textContent).toContain('Alta');
  });

  it('renders data quality with red bg for baja rating', () => {
    const { container } = render(<ReportContent report={criticalReport} />);
    const bajaBadges = container.querySelectorAll('.bg-red-100');
    expect(bajaBadges.length).toBeGreaterThanOrEqual(1);
  });

  it('renders discrepancies section with severity styling', () => {
    render(<ReportContent report={criticalReport} />);
    expect(
      screen.getByText('Discrepancias Detectadas'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'El indicador de TMI muestra 8.5 pero documento de MSAL indica 9.1',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Diferencia menor en tasa de fecundidad adolescente'),
    ).toBeInTheDocument();
  });

  it('renders cross-references section with source badges', () => {
    render(<ReportContent report={criticalReport} />);
    expect(
      screen.getByText('Referencias Cruzadas'),
    ).toBeInTheDocument();
    expect(screen.getByText('Informe MSAL 2022')).toBeInTheDocument();
    expect(screen.getByText('UNICEF Argentina')).toBeInTheDocument();
    expect(screen.getByText('Documento')).toBeInTheDocument();
    expect(screen.getByText('Web')).toBeInTheDocument();
  });

  it('renders suggested improvements section', () => {
    render(<ReportContent report={criticalReport} />);
    expect(
      screen.getByText('Mejoras Sugeridas'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Actualizar fuente de datos de MSAL a 2024'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Agregar desglose por género en indicadores de salud'),
    ).toBeInTheDocument();
  });

  it('does not render critical sections when absent (backward compat)', () => {
    render(<ReportContent report={mockReport} />);
    expect(
      screen.queryByText('Calidad de Datos por Categoría'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Discrepancias Detectadas'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Referencias Cruzadas'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Mejoras Sugeridas'),
    ).not.toBeInTheDocument();
  });
});
