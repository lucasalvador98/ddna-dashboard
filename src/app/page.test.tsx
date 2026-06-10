import { describe, it, expect, vi } from 'vitest';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {},
  CategoriaIndicador: 'inversion',
}));

// Mock the useDashboardData hook to return controlled data
const mockInversionData = [
  {
    id: 'i1',
    indicador_nombre: 'Inversión social infancia',
    categoria: 'inversion',
    valor: 45_200_000_000,
    unidad: 'Md',
    periodo: '2024',
    region: 'Córdoba',
    desglose: { categoria: 'Educación básica (inicial, elemental y media)' },
  },
];

const mockPobrezaData = [
  {
    id: 'p1',
    indicador_nombre: 'Pobreza personas',
    categoria: 'pobreza',
    valor: 39.2,
    unidad: '%',
    periodo: '2024-S2',
    region: 'Córdoba',
    desglose: { semestre: 2 },
  },
];

const mockSaludData = [
  {
    id: 's1',
    indicador_nombre: 'Mortalidad infantil (TMI Cba)',
    categoria: 'salud',
    valor: 8.5,
    unidad: '‰',
    periodo: '2023',
    region: 'Córdoba',
    desglose: {},
  },
];

const mockEducacionData = [
  {
    id: 'e1',
    indicador_nombre: 'Tasa de asistencia educativa',
    categoria: 'educacion',
    valor: 89.2,
    unidad: '%',
    periodo: '2022',
    region: 'Córdoba',
    desglose: { edad: '10' },
  },
];

const mockDemografiaData = [
  {
    id: 'd1',
    indicador_nombre: 'Población por edad',
    categoria: 'demografia',
    valor: 40495,
    unidad: 'hab',
    periodo: '2022',
    region: 'Córdoba',
    desglose: { edad: '0', sexo: 'total' },
  },
];

const mockSeguridadData = [
  {
    id: 'sg1',
    indicador_nombre: 'Total casos sistema de justicia',
    categoria: 'seguridad',
    valor: 64466,
    unidad: 'casos',
    periodo: '2022',
    region: 'Córdoba',
    desglose: {},
  },
];

vi.mock('@/lib/use-dashboard-data', () => ({
  useDashboardData: () => ({
    data: {
      inversion: mockInversionData,
      pobreza: mockPobrezaData,
      salud: mockSaludData,
      educacion: mockEducacionData,
      demografia: mockDemografiaData,
      seguridad: mockSeguridadData,
    },
    loading: false,
    source: 'supabase' as const,
  }),
  getLatestValue: (data: Array<{ indicador_nombre: string; valor: number }>, name?: string) => {
    if (!name) return data[0] ?? null;
    return (
      data.find(d => d.indicador_nombre.toLowerCase().includes(name.toLowerCase())) ??
      data[0] ??
      null
    );
  },
  getTimeSeries: () => [],
  calculateChange: () => [],
  getInversionTotal: () => 45_200_000_000,
  getPoblacion0a17: () => 40495,
  findStatValue: () => null,
  findStatSum: () => null,
  parseDesglose: (raw: unknown) => {
    if (!raw) return {};
    if (typeof raw === 'string') return JSON.parse(raw);
    return raw as Record<string, unknown>;
  },
}));

// Mock navigation components
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock report-modal
vi.mock('@/components/report-modal', () => ({
  ReportModal: () => null,
}));

// Mock kpi-card
vi.mock('@/components/kpi-card', () => ({
  KpiCard: ({ title, value, subtitle }: { title: string; value: string; subtitle: string }) => (
    <div data-testid="kpi-card" data-title={title} data-value={value}>
      <div>{title}</div>
      <div>{value}</div>
      <div>{subtitle}</div>
    </div>
  ),
}));

// Mock section-card
vi.mock('@/components/section-card', () => ({
  SectionCard: ({ title }: { title: string }) => <div data-testid="section-card">{title}</div>,
}));

// Mock report-modal
vi.mock('@/components/report-modal', () => ({
  ReportModal: () => null,
}));

import { render, screen } from '@testing-library/react';
import HomePage from './page';

describe('HomePage — KPI data presence', () => {
  it('should show inversion total using formatInversionValue format with space before Md', () => {
    render(<HomePage />);

    // Check that the "Inversión social" KPI value is formatted with formatInversionValue
    // formatInversionValue(45_200_000_000) → "$45,200.0 Md"
    const valueElement = screen.getByText('$45,200.0 Md');
    expect(valueElement).toBeInTheDocument();
  });

  it('should show real poverty data (not placeholder "—")', () => {
    render(<HomePage />);

    // Pobreza personas should show 39.2%
    expect(screen.getByText('39.2%')).toBeInTheDocument();
  });

  it('should show real mortality data (not placeholder "—")', () => {
    render(<HomePage />);

    // TMI should show 8.5‰
    expect(screen.getByText('8.5‰')).toBeInTheDocument();
  });

  it('should show real education data (not placeholder "—")', () => {
    render(<HomePage />);

    // Asistencia educativa should show 89.2%
    expect(screen.getByText('89.2%')).toBeInTheDocument();
  });

  it('should show real population data (not placeholder "—")', () => {
    render(<HomePage />);

    // Population 0-17 should show formatted number
    expect(screen.getByText('40.495')).toBeInTheDocument();
  });

  it('should show real security data (not placeholder "—")', () => {
    render(<HomePage />);

    // Denuncias should show 64,466
    expect(screen.getByText('64.466')).toBeInTheDocument();
  });

  it('should show all 6 KPI cards', () => {
    render(<HomePage />);

    const kpiCards = screen.getAllByTestId('kpi-card');
    expect(kpiCards.length).toBe(6);
  });

  it('should show data source indicator', () => {
    render(<HomePage />);

    // The source indicator shows "Datos en vivo" or "Datos de referencia"
    // It may be hidden on small screens (hidden sm:inline), so check the badge dot
    const badge = document.querySelector('.rounded-full');
    expect(badge).toBeInTheDocument();
  });
});
