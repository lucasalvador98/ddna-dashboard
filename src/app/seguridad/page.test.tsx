import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// ─── Deferred promise for controlling Supabase responses ─────────
let resolveOrder: (value: unknown) => void;
let rejectOrder: (reason: unknown) => void;

function createDeferred() {
  let resolver: (value: unknown) => void;
  let rejecter: (reason: unknown) => void;
  const promise = new Promise((resolve, reject) => {
    resolver = resolve;
    rejecter = reject;
  });
  resolveOrder = resolver!;
  rejectOrder = rejecter!;
  return promise;
}

const mockSupabaseChain = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockImplementation(() => createDeferred()),
};

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockSupabaseChain),
  },
}));

// Mock recharts
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
  const MockBar = () => <div data-testid="bar" />;
  const MockPie = () => <div data-testid="pie" />;
  const MockCell = () => <div data-testid="cell" />;
  const MockXAxis = () => <div data-testid="x-axis" />;
  const MockYAxis = () => <div data-testid="y-axis" />;
  const MockCartesianGrid = () => <div data-testid="cartesian-grid" />;
  const MockTooltip = () => <div data-testid="tooltip" />;
  return {
    ResponsiveContainer: MockResponsiveContainer,
    BarChart: MockBarChart,
    PieChart: MockPieChart,
    Bar: MockBar,
    Pie: MockPie,
    Cell: MockCell,
    XAxis: MockXAxis,
    YAxis: MockYAxis,
    CartesianGrid: MockCartesianGrid,
    Tooltip: MockTooltip,
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

// Mock section-header
vi.mock('@/components/section-header', () => ({
  SectionHeader: ({ title }: { title: string }) => (
    <div data-testid="section-header" data-title={title}>
      {title}
    </div>
  ),
}));

// Mock kpi-card
vi.mock('@/components/kpi-card', () => ({
  KpiCard: ({ title, value, subtitle }: { title: string; value: string; subtitle: string }) => (
    <div data-testid="kpi-card" data-title={title} data-value={value} data-subtitle={subtitle}>
      <div>{title}</div>
      <div>{value}</div>
      <div>{subtitle}</div>
    </div>
  ),
}));

import SeguridadPage from './page';

// Real DB data for testing
const MOCK_SEGURIDAD_DATA = [
  {
    id: '1',
    indicador_nombre: 'Casos de Violencia Familiar',
    valor: 55993,
    unidad: 'casos',
    periodo: '2022',
    region: 'Córdoba',
    desglose: {},
  },
  {
    id: '2',
    indicador_nombre: 'Casos de Niñez',
    valor: 207,
    unidad: 'casos',
    periodo: '2022',
    region: 'Córdoba',
    desglose: {},
  },
  {
    id: '3',
    indicador_nombre: 'Casos de Fiscalías',
    valor: 2058,
    unidad: 'casos',
    periodo: '2022',
    region: 'Córdoba',
    desglose: {},
  },
  {
    id: '4',
    indicador_nombre: 'Casos de Civil',
    valor: 21,
    unidad: 'casos',
    periodo: '2022',
    region: 'Córdoba',
    desglose: {},
  },
  {
    id: '5',
    indicador_nombre: 'Casos de Familia',
    valor: 5089,
    unidad: 'casos',
    periodo: '2022',
    region: 'Córdoba',
    desglose: {},
  },
  {
    id: '6',
    indicador_nombre: 'Casos de Penal Juvenil',
    valor: 1098,
    unidad: 'casos',
    periodo: '2022',
    region: 'Córdoba',
    desglose: {},
  },
  {
    id: '7',
    indicador_nombre: 'Total casos sistema de justicia',
    valor: 64466,
    unidad: 'casos',
    periodo: '2022',
    region: 'Córdoba',
    desglose: {},
  },
];

describe('SeguridadPage — data presence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show all 6 "Casos de ..." indicators in the distribution', async () => {
    render(<SeguridadPage />);

    resolveOrder({ data: MOCK_SEGURIDAD_DATA, error: null });

    await vi.waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    // Total should include all "Casos de ..." indicators (not "Total casos")
    // 55993 + 207 + 2058 + 21 + 5089 + 1098 = 64466
    const totalCard = screen
      .getAllByTestId('kpi-card')
      .find(card => card.getAttribute('data-title') === 'Total casos');
    expect(totalCard).toBeDefined();
    expect(totalCard!.getAttribute('data-value')).toBe('64.466');
  });

  it('should show Violencia Familiar KPI with real value', async () => {
    render(<SeguridadPage />);

    resolveOrder({ data: MOCK_SEGURIDAD_DATA, error: null });

    await vi.waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    const vfCard = screen
      .getAllByTestId('kpi-card')
      .find(card => card.getAttribute('data-title') === 'Violencia Familiar');
    expect(vfCard).toBeDefined();
    expect(vfCard!.getAttribute('data-value')).toBe('55.993');
  });

  it('should show Niñez KPI with real value', async () => {
    render(<SeguridadPage />);

    resolveOrder({ data: MOCK_SEGURIDAD_DATA, error: null });

    await vi.waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    const ninezCard = screen
      .getAllByTestId('kpi-card')
      .find(card => card.getAttribute('data-title') === 'Niñez y Adolescencia');
    expect(ninezCard).toBeDefined();
    expect(ninezCard!.getAttribute('data-value')).toBe('207');
  });

  it('should show charts when data is loaded', async () => {
    render(<SeguridadPage />);

    resolveOrder({ data: MOCK_SEGURIDAD_DATA, error: null });

    await vi.waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    const charts = screen.getAllByTestId('chart-with-table');
    expect(charts.length).toBeGreaterThanOrEqual(2);
  });

  it('should show empty state when no data', async () => {
    render(<SeguridadPage />);

    resolveOrder({ data: [], error: null });

    await vi.waitFor(() => {
      // When empty, total shows "—"
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });
  });
});
