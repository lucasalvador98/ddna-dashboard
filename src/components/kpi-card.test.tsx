import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KpiCard } from './kpi-card';

function MockIcon({ className }: { className?: string }) {
  return <svg data-testid="mock-icon" className={className} />;
}

describe('KpiCard', () => {
  it('renders title, value and subtitle', () => {
    render(
      <KpiCard title="Tasa de mortalidad" value="8.5" subtitle="Por cada 1000 nacidos" icon={MockIcon} color="blue" />,
    );
    expect(screen.getByText('Tasa de mortalidad')).toBeInTheDocument();
    expect(screen.getByText('8.5')).toBeInTheDocument();
    expect(screen.getByText('Por cada 1000 nacidos')).toBeInTheDocument();
  });

  it('does not render change badge when change is omitted', () => {
    render(<KpiCard title="Test" value="100" subtitle="Desc" icon={MockIcon} color="blue" />);
    expect(screen.queryByText('+5%')).not.toBeInTheDocument();
    expect(screen.queryByText('-3%')).not.toBeInTheDocument();
  });

  it('shows positive change with TrendingUp icon', () => {
    render(
      <KpiCard
        title="Crecimiento"
        value="10%"
        subtitle="YoY"
        change="+5%"
        changeType="up"
        icon={MockIcon}
        color="green"
      />,
    );
    expect(screen.getByText('+5%')).toBeInTheDocument();
  });

  it('shows negative change with TrendingDown icon', () => {
    render(
      <KpiCard
        title="Descenso"
        value="-3%"
        subtitle="Trimestral"
        change="-3.2%"
        changeType="down"
        icon={MockIcon}
        color="magenta"
      />,
    );
    expect(screen.getByText('-3.2%')).toBeInTheDocument();
  });

  it('shows neutral change badge', () => {
    render(
      <KpiCard
        title="Estable"
        value="50"
        subtitle="Sin cambios"
        change="0%"
        changeType="neutral"
        icon={MockIcon}
        color="navy"
      />,
    );
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders icon with correct color class', () => {
    render(<KpiCard title="Test" value="1" subtitle="Desc" icon={MockIcon} color="blue" />);
    const icon = screen.getByTestId('mock-icon');
    expect(icon.getAttribute('class')).toContain('text-[#3777FF]');
  });

  it('renders icon with different color per prop', () => {
    const { rerender } = render(
      <KpiCard title="Test" value="1" subtitle="Desc" icon={MockIcon} color="amber" />,
    );
    expect(screen.getByTestId('mock-icon').getAttribute('class')).toContain('text-[#F3A712]');

    rerender(<KpiCard title="Test" value="1" subtitle="Desc" icon={MockIcon} color="green" />);
    expect(screen.getByTestId('mock-icon').getAttribute('class')).toContain('text-[#10B981]');
  });
});
