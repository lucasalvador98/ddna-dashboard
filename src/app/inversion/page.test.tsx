import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InversionCharts, type InversionRow } from './inversion-charts';

// ———————————————————————————————————————————————
// Mock data
// ———————————————————————————————————————————————

const mockInversionData: InversionRow[] = [
  {
    id: '1',
    indicador_nombre: 'Inversión en educación',
    categoria: 'inversion',
    valor: 10_000_000_000,
    unidad: '',
    periodo: '2024',
    region: '',
    desglose: {
      categoria: 'Educación básica (inicial, elemental y media)',
      organismo: 'Ministerio de Educación',
    },
  },
  {
    id: '2',
    indicador_nombre: 'Inversión en comedores',
    categoria: 'inversion',
    valor: 5_000_000_000,
    unidad: '',
    periodo: '2024',
    region: '',
    desglose: {
      categoria: 'Comedores escolares y copa de leche',
      organismo: 'Ministerio de Educación',
    },
  },
  {
    id: '3',
    indicador_nombre: 'Inversión en salud',
    categoria: 'inversion',
    valor: 8_000_000_000,
    unidad: '',
    periodo: '2024',
    region: '',
    desglose: { categoria: 'Materno-infantil', organismo: 'Ministerio de Salud' },
  },
  {
    id: '4',
    indicador_nombre: 'Inversión en prevención',
    categoria: 'inversion',
    valor: 3_000_000_000,
    unidad: '',
    periodo: '2024',
    region: '',
    desglose: { categoria: 'Atención ambulatoria e internación', organismo: 'Ministerio de Salud' },
  },
  {
    id: '5',
    indicador_nombre: 'Inversión en educación',
    categoria: 'inversion',
    valor: 9_000_000_000,
    unidad: '',
    periodo: '2023',
    region: '',
    desglose: {
      categoria: 'Educación básica (inicial, elemental y media)',
      organismo: 'Ministerio de Educación',
    },
  },
  {
    id: '6',
    indicador_nombre: 'Inversión en salud',
    categoria: 'inversion',
    valor: 7_000_000_000,
    unidad: '',
    periodo: '2023',
    region: '',
    desglose: { categoria: 'Materno-infantil', organismo: 'Ministerio de Salud' },
  },
  {
    id: '7',
    indicador_nombre: 'Inversión en infraestructura',
    categoria: 'inversion',
    valor: 2_000_000_000,
    unidad: '',
    periodo: '2024',
    region: '',
    desglose: { categoria: 'Infraestructura general', organismo: 'Ministerio de Obras' },
  },
  {
    id: '8',
    indicador_nombre: 'Sin categoría',
    categoria: 'inversion',
    valor: 1_000_000_000,
    unidad: '',
    periodo: '2024',
    region: '',
    desglose: {},
  },
];

const periods = ['2024', '2023'];
const evolutionData: Record<string, unknown>[] = [
  { periodo: '2023', Educación: 0, Salud: 0, 'Desarrollo Social': 0, 'Niñez y Adolescencia': 0, Otros: 16_000_000_000 },
  { periodo: '2024', Educación: 0, Salud: 0, 'Desarrollo Social': 0, 'Niñez y Adolescencia': 0, Otros: 27_000_000_000 },
];

// Mock recharts
vi.mock('recharts', () => {
  const MockResponsiveContainer = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  );
  const MockBarChart = ({ children, data }: { children: React.ReactNode; data?: unknown[] }) => (
    <div data-testid="bar-chart" data-has-data={String((data ?? []).length > 0)}>
      {children}
    </div>
  );
  const MockBar = () => <div data-testid="bar" />;
  const MockXAxis = () => <div data-testid="x-axis" />;
  const MockYAxis = () => <div data-testid="y-axis" />;
  const MockCartesianGrid = () => <div data-testid="cartesian-grid" />;
  const MockTooltip = () => <div data-testid="tooltip" />;
  const MockLineChart = ({ children, data }: { children: React.ReactNode; data?: unknown[] }) => (
    <div data-testid="line-chart" data-has-data={String((data ?? []).length > 0)}>
      {children}
    </div>
  );
  const MockLine = () => <div data-testid="line" />;
  const MockLegend = () => <div data-testid="legend" />;
  const MockCell = () => <div data-testid="cell" />;
  return {
    ResponsiveContainer: MockResponsiveContainer,
    BarChart: MockBarChart,
    Bar: MockBar,
    XAxis: MockXAxis,
    YAxis: MockYAxis,
    CartesianGrid: MockCartesianGrid,
    Tooltip: MockTooltip,
    LineChart: MockLineChart,
    Line: MockLine,
    Legend: MockLegend,
    Cell: MockCell,
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

describe('InversionCharts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render KPI cards with correctly formatted total', () => {
    render(
      <InversionCharts
        inversionData={mockInversionData}
        periods={periods}
        evolutionData={evolutionData}
      />
    );

    expect(screen.getByText('Inversión en Infancia 2024')).toBeInTheDocument();
    expect(screen.getByText('$26.0 mil millones')).toBeInTheDocument();
  });

  it('should show "En Educación" KPI with education label', () => {
    render(
      <InversionCharts
        inversionData={mockInversionData}
        periods={periods}
        evolutionData={evolutionData}
      />
    );

    expect(screen.getByText('En Educación')).toBeInTheDocument();
  });

  it('should show "En Salud" KPI with health label', () => {
    render(
      <InversionCharts
        inversionData={mockInversionData}
        periods={periods}
        evolutionData={evolutionData}
      />
    );

    expect(screen.getByText('En Salud')).toBeInTheDocument();
  });

  it('should render period selector with all available periods', () => {
    render(
      <InversionCharts
        inversionData={mockInversionData}
        periods={periods}
        evolutionData={evolutionData}
      />
    );

    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
  });

  it('should default to latest period (2024) being active', () => {
    render(
      <InversionCharts
        inversionData={mockInversionData}
        periods={periods}
        evolutionData={evolutionData}
      />
    );

    const period2024 = screen.getByText('2024');
    expect(period2024.tagName).toBe('BUTTON');
  });

  it('should show change badge when multiple periods exist', () => {
    render(
      <InversionCharts
        inversionData={mockInversionData}
        periods={periods}
        evolutionData={evolutionData}
      />
    );

    expect(screen.getByText('+62.5%')).toBeInTheDocument();
  });

  it('should render charts when multiple periods exist', () => {
    render(
      <InversionCharts
        inversionData={mockInversionData}
        periods={periods}
        evolutionData={evolutionData}
      />
    );

    const charts = screen.getAllByTestId('chart-with-table');
    expect(charts.length).toBe(2);
    expect(charts[0]).toHaveAttribute('data-title', 'Evolución del Presupuesto Ponderado NNyA');
  });

  it('should update displayed data when a different period is selected', () => {
    render(
      <InversionCharts
        inversionData={mockInversionData}
        periods={periods}
        evolutionData={evolutionData}
      />
    );

    const period2023 = screen.getByText('2023');
    fireEvent.click(period2023);

    expect(screen.getByText(/Inversión en Infancia 2023/)).toBeInTheDocument();
  });
});
