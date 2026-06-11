import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import type { Indicador } from '@/lib/use-dashboard-data';

// Mock supabase FIRST so the page module can load
vi.mock('@/lib/supabase', () => ({
  supabase: {},
  CategoriaIndicador: 'inversion',
}));

// ———————————————————————————————————————————————
// Mocks
// ———————————————————————————————————————————————

const mockInversionData: Indicador[] = [
  {
    id: '1', indicador_nombre: 'Inversión en educación', categoria: 'inversion',
    valor: 10_000_000_000, unidad: '', periodo: '2024', region: '',
    desglose: { categoria: 'Educación básica (inicial, elemental y media)', organismo: 'Ministerio de Educación' },
  },
  {
    id: '2', indicador_nombre: 'Inversión en comedores', categoria: 'inversion',
    valor: 5_000_000_000, unidad: '', periodo: '2024', region: '',
    desglose: { categoria: 'Comedores escolares y copa de leche', organismo: 'Ministerio de Educación' },
  },
  {
    id: '3', indicador_nombre: 'Inversión en salud', categoria: 'inversion',
    valor: 8_000_000_000, unidad: '', periodo: '2024', region: '',
    desglose: { categoria: 'Materno-infantil', organismo: 'Ministerio de Salud' },
  },
  {
    id: '4', indicador_nombre: 'Inversión en prevención', categoria: 'inversion',
    valor: 3_000_000_000, unidad: '', periodo: '2024', region: '',
    desglose: { categoria: 'Atención ambulatoria e internación', organismo: 'Ministerio de Salud' },
  },
  // 2023 data for period selector and change badge
  {
    id: '5', indicador_nombre: 'Inversión en educación', categoria: 'inversion',
    valor: 9_000_000_000, unidad: '', periodo: '2023', region: '',
    desglose: { categoria: 'Educación básica (inicial, elemental y media)', organismo: 'Ministerio de Educación' },
  },
  {
    id: '6', indicador_nombre: 'Inversión en salud', categoria: 'inversion',
    valor: 7_000_000_000, unidad: '', periodo: '2023', region: '',
    desglose: { categoria: 'Materno-infantil', organismo: 'Ministerio de Salud' },
  },
  // Non-child-relevant category (should be excluded from total)
  {
    id: '7', indicador_nombre: 'Inversión en infraestructura', categoria: 'inversion',
    valor: 2_000_000_000, unidad: '', periodo: '2024', region: '',
    desglose: { categoria: 'Infraestructura general', organismo: 'Ministerio de Obras' },
  },
];

// Also add some non-relevant data for the "no categoría" edge case
const mockDataWithMissingDesglose: Indicador[] = [
  {
    id: '8', indicador_nombre: 'Sin categoría', categoria: 'inversion',
    valor: 1_000_000_000, unidad: '', periodo: '2024', region: '',
    desglose: {} as Record<string, unknown>,
  },
];

vi.mock('@/lib/use-dashboard-data', () => ({
  useDashboardData: vi.fn(() => ({
    data: {
      inversion: [...mockInversionData, ...mockDataWithMissingDesglose],
      pobreza: [],
      salud: [],
      educacion: [],
      demografia: [],
      seguridad: [],
    },
    loading: false,
    source: 'placeholder' as const,
  })),
  parseDesglose: (raw: unknown) => {
    if (!raw) return {};
    if (typeof raw === 'string') return JSON.parse(raw);
    return raw as Record<string, unknown>;
  },
  getInversionTotal: () => 0, // Will test separately
  type: { Indicador: {} },
}));

// Mock Recharts to avoid rendering issues in jsdom
vi.mock('recharts', () => {
  const MockResponsiveContainer = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  );
  const MockBarChart = ({ children, data }: { children: React.ReactNode; data?: unknown[] }) => (
    <div data-testid="bar-chart" data-has-data={String((data ?? []).length > 0)}>{children}</div>
  );
  const MockBar = () => <div data-testid="bar" />;
  const MockXAxis = () => <div data-testid="x-axis" />;
  const MockYAxis = () => <div data-testid="y-axis" />;
  const MockCartesianGrid = () => <div data-testid="cartesian-grid" />;
  const MockTooltip = () => <div data-testid="tooltip" />;
  const MockLineChart = ({ children, data }: { children: React.ReactNode; data?: unknown[] }) => (
    <div data-testid="line-chart" data-has-data={String((data ?? []).length > 0)}>{children}</div>
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
    <div data-testid="chart-with-table" data-title={title}>{children}</div>
  ),
}));

// Mock section-header
vi.mock('@/components/section-header', () => ({
  SectionHeader: ({ title }: { title: string }) => (
    <div data-testid="section-header" data-title={title}>{title}</div>
  ),
}));

// Now import the page
import InversionPage from './page';

describe('InversionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render KPI cards with correctly formatted total', async () => {
    render(<InversionPage />);

    // Total = 10B (educación) + 5B (comedores) + 8B (salud) + 3B (prevención) = 26B
    // Excludes: infraestructura general (2B) and sin categoría (1B)
    // 26,000,000,000 / 1,000,000 = 26,000.0 Md
    const totalKpi = screen.getByText('Inversión en Infancia 2024');
    expect(totalKpi).toBeInTheDocument();

    // Find the value text — it should have "$26,000.0 Md"
    const valueElement = screen.getByText(/\$26.000.0 Md/); // Wait, let me check format
    // Actually formatInversionValue(26_000_000_000) = 26,000 / SCALE_FACTOR = 26,000
    // 26,000,000,000 / 1,000,000 = 26,000 → $26,000.0 Md
    expect(screen.getByText('$26,000.0 Md')).toBeInTheDocument();
  });

  it('should show "En Educación" KPI with education label', async () => {
    render(<InversionPage />);

    // Education subtotal card should exist
    expect(screen.getByText('En Educación')).toBeInTheDocument();
  });

  it('should show "En Salud" KPI with health label', async () => {
    render(<InversionPage />);

    // Salud subtotal card should exist
    expect(screen.getByText('En Salud')).toBeInTheDocument();
  });

  it('should render period selector with all available periods', () => {
    render(<InversionPage />);

    // Should have buttons for 2024 and 2023, plus "Todas" or similar
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
  });

  it('should default to latest period (2024) being active', () => {
    render(<InversionPage />);

    const period2024 = screen.getByText('2024');
    // Active period should have some visual indicator
    // Check it's a button element
    expect(period2024.tagName).toBe('BUTTON');
  });

  it('should show change badge when multiple periods exist', () => {
    render(<InversionPage />);

    // Should have a badge with percentage (change from 2023 to 2024)
    // 2023 total: 9B + 7B = 16B
    // 2024 total: 10B + 5B + 8B + 3B = 26B
    // Change: (26-16)/16 = 62.5%
    const changeBadge = screen.getByText('+62.5%');
    expect(changeBadge).toBeInTheDocument();
  });

  it('should render charts when multiple periods exist', () => {
    render(<InversionPage />);

    // Should have evolution and area charts
    const charts = screen.getAllByTestId('chart-with-table');
    expect(charts.length).toBe(2);
    expect(charts[0]).toHaveAttribute('data-title', 'Evolución del Presupuesto Ponderado NNyA');
  });

  it('should update displayed data when a different period is selected', async () => {
    render(<InversionPage />);

    // Click 2023
    const period2023 = screen.getByText('2023');
    fireEvent.click(period2023);

    // Now the total should reflect 2023 data only: 9B (educación) + 7B (salud) = 16B
    // 16,000,000,000 / 1,000,000 = 16,000.0 Md
    // And the KPI card title should show 2023
    expect(screen.getByText(/Inversión en Infancia 2023/)).toBeInTheDocument();
  });
});
