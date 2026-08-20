import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

type KpiColor = 'amber' | 'magenta' | 'blue' | 'terracotta' | 'navy' | 'orange' | 'green';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: KpiColor;
}

const colorClasses: Record<KpiColor, { border: string; iconBg: string; iconText: string }> = {
  amber: {
    border: 'border-l-amber',
    iconBg: 'bg-amber/10',
    iconText: 'text-amber',
  },
  magenta: {
    border: 'border-l-magenta',
    iconBg: 'bg-magenta/10',
    iconText: 'text-magenta',
  },
  blue: {
    border: 'border-l-blue',
    iconBg: 'bg-blue/10',
    iconText: 'text-blue',
  },
  terracotta: {
    border: 'border-l-terracotta',
    iconBg: 'bg-terracotta/10',
    iconText: 'text-terracotta',
  },
  navy: {
    border: 'border-l-navy',
    iconBg: 'bg-navy/10',
    iconText: 'text-navy',
  },
  orange: {
    border: 'border-l-orange',
    iconBg: 'bg-orange/10',
    iconText: 'text-orange',
  },
  green: {
    border: 'border-l-[#10B981]',
    iconBg: 'bg-[#10B981]/10',
    iconText: 'text-[#10B981]',
  },
};

export function KpiCard({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral',
  icon: Icon,
  color,
}: KpiCardProps) {
  const colors = colorClasses[color];

  return (
    <article
      className={clsx(
        'bg-white rounded-xl border border-border border-l-4 p-5',
        'transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:shadow-lg',
        colors.border
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Icon */}
        <div
          className={clsx(
            'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
            colors.iconBg
          )}
        >
          <Icon className={clsx('w-6 h-6', colors.iconText)} />
        </div>

        {/* Change Indicator */}
        {change && (
          <div
            className={clsx(
              'flex items-center gap-1 text-sm font-body font-medium px-2 py-1 rounded-full',
              changeType === 'up' && 'bg-success/10 text-success',
              changeType === 'down' && 'bg-error/10 text-error',
              changeType === 'neutral' && 'bg-border/50 text-text-primary'
            )}
          >
            {changeType === 'up' && <TrendingUp className="w-4 h-4" />}
            {changeType === 'down' && <TrendingDown className="w-4 h-4" />}
            <span>{change}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-4">
        <h3 className="font-accent text-sm text-text-primary tracking-wide">{title}</h3>
        <p className="font-display text-4xl text-navy mt-1">{value}</p>
        <p className="font-body text-sm text-text-primary/70 mt-2 leading-relaxed">{subtitle}</p>
      </div>
    </article>
  );
}
