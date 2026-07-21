import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock recharts — all components used by SeguridadCharts
vi.mock('recharts', () => {
  const MockResponsiveContainer = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  );
  const MockBarChart = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  );
  const MockPieChart = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  );
  const MockLineChart = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  );
  const MockBar = () => <div data-testid="bar" />;
  const MockPie = () => <div data-testid="pie" />;
  const MockCell = () => <div data-testid="cell" />;
  const MockXAxis = () => <div data-testid="x-axis" />;
  const MockYAxis = () => <div data-testid="y-axis" />;
  const MockCartesianGrid = () => <div data-testid="cartesian-grid" />;
  const MockTooltip = () => <div data-testid="tooltip" />;
  const MockLegend = () => <div data-testid="legend" />;
  const MockLine = () => <div data-testid="line" />;
  return {
    ResponsiveContainer: MockResponsiveContainer,
    BarChart: MockBarChart,
    PieChart: MockPieChart,
    LineChart: MockLineChart,
    Bar: MockBar,
    Pie: MockPie,
    Cell: MockCell,
    XAxis: MockXAxis,
    YAxis: MockYAxis,
    CartesianGrid: MockCartesianGrid,
    Tooltip: MockTooltip,
    Legend: MockLegend,
    Line: MockLine,
  };
});

// Mock chart-with-table
vi.mock('@/components/charts/chart-with-table', () => ({
  ChartWithTable: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid="chart-with-table" data-title={title}>
      {children}
    </div>
  ),
}));

import { SeguridadCharts } from './seguridad-charts';

const distribucionData = [
  { name: 'Violencia Familiar', value: 55993 },
  { name: 'Familia', value: 5089 },
  { name: 'Fiscalías', value: 2058 },
  { name: 'Penal Juvenil', value: 1098 },
  { name: 'Niñez', value: 207 },
  { name: 'Civil', value: 21 },
];

const total = 64466;

const crimeChartData = [
  {
    periodo: 2020,
    'Tentativas de hurto': 500,
    'Tasa tentativas hurto (x100K)': 50,
    Contravenciones: 200,
    'Robos y tentativa': 300,
  },
  {
    periodo: 2021,
    'Tentativas de hurto': 450,
    'Tasa tentativas hurto (x100K)': 45,
    Contravenciones: 180,
    'Robos y tentativa': 280,
  },
  {
    periodo: 2022,
    'Tentativas de hurto': 400,
    'Tasa tentativas hurto (x100K)': 40,
    Contravenciones: 160,
    'Robos y tentativa': 250,
  },
];

const crimeSeries = [
  { label: 'Tentativas de hurto', color: '#3777FF' },
  { label: 'Tasa tentativas hurto (x100K)', color: '#BF1363' },
  { label: 'Contravenciones', color: '#F3A712' },
  { label: 'Robos y tentativa', color: '#E07A5F' },
];

describe('SeguridadCharts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all three charts when full data is provided', () => {
    render(
      <SeguridadCharts
        distribucionData={distribucionData}
        total={total}
        crimeChartData={crimeChartData}
        crimeSeries={crimeSeries}
        crimeYearRange="2020–2022"
      />
    );

    const charts = screen.getAllByTestId('chart-with-table');
    expect(charts).toHaveLength(3);

    const titles = charts.map(c => c.getAttribute('data-title'));
    expect(titles).toContain('Casos por Tipo');
    expect(titles).toContain('Distribución Porcentual');
    expect(titles).toContain('Evolución de Delitos');
  });

  it('renders bar, pie, and line chart elements', () => {
    render(
      <SeguridadCharts
        distribucionData={distribucionData}
        total={total}
        crimeChartData={crimeChartData}
        crimeSeries={crimeSeries}
        crimeYearRange="2020–2022"
      />
    );

    expect(screen.getByTestId('bar-chart')).toBeDefined();
    expect(screen.getByTestId('pie-chart')).toBeDefined();
    expect(screen.getByTestId('line-chart')).toBeDefined();
  });

  it('hides evolution chart when no crime data', () => {
    render(
      <SeguridadCharts
        distribucionData={distribucionData}
        total={total}
        crimeChartData={[]}
        crimeSeries={[]}
        crimeYearRange=""
      />
    );

    const charts = screen.getAllByTestId('chart-with-table');
    expect(charts).toHaveLength(2);
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
  });

  it('renders gracefully with empty distribucionData', () => {
    render(
      <SeguridadCharts
        distribucionData={[]}
        total={0}
        crimeChartData={[]}
        crimeSeries={[]}
        crimeYearRange=""
      />
    );

    const charts = screen.getAllByTestId('chart-with-table');
    expect(charts).toHaveLength(2);
  });
});
