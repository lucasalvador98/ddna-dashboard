import { describe, it, expect, vi } from 'vitest';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {},
  CategoriaIndicador: 'inversion',
}));

// Mock the useDashboardData hook to return controlled data
const mockInversionData = [
  {
    id: 'i1', indicador_nombre: 'Inversión social infancia', categoria: 'inversion',
    valor: 45_200_000_000, unidad: 'Md', periodo: '2024', region: 'Córdoba',
    desglose: { categoria: 'Educación básica (inicial, elemental y media)' },
  },
];

vi.mock('@/lib/use-dashboard-data', () => ({
  useDashboardData: () => ({
    data: {
      inversion: mockInversionData,
      pobreza: [],
      salud: [],
      educacion: [],
      demografia: [],
      seguridad: [],
    },
    loading: false,
    source: 'placeholder' as const,
  }),
  getLatestValue: () => null,
  getTimeSeries: () => [],
  calculateChange: () => [],
  getInversionTotal: () => 45_200_000_000,
  getPoblacion0a17: () => 0,
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
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    <a href={href}>{children}</a>,
}));

import { render, screen } from '@testing-library/react';
import HomePage from './page';

describe('HomePage inversion KPI', () => {
  it('should show inversion total using formatInversionValue format with space before Md', () => {
    render(<HomePage />);

    // Check that the "Inversión social" KPI value is formatted with formatInversionValue
    // formatInversionValue(45_200_000_000) → "$45,200.0 Md"
    const valueElement = screen.getByText('$45,200.0 Md');
    expect(valueElement).toBeInTheDocument();
  });

  it('should still show non-inversion KPIs correctly', () => {
    render(<HomePage />);

    // These should still work with their original formatting
    // Since we mocked everything to return null, multiple "—" exist
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThanOrEqual(3);
  });
});
