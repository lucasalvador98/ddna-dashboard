import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import clsx from 'clsx';

type SectionColor = 'amber' | 'magenta' | 'blue' | 'terracotta' | 'navy' | 'orange';

interface SectionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: SectionColor;
  stats?: {
    label: string;
    value: string;
  }[];
}

const colorClasses: Record<
  SectionColor,
  { bg: string; border: string; iconBg: string; iconText: string; hover: string; hoverText: string }
> = {
  amber: {
    bg: 'bg-amber/5',
    border: 'border-amber/30',
    iconBg: 'bg-amber',
    iconText: 'text-navy',
    hover: 'hover:border-amber/60',
    hoverText: 'group-hover:text-amber',
  },
  magenta: {
    bg: 'bg-magenta/5',
    border: 'border-magenta/30',
    iconBg: 'bg-magenta',
    iconText: 'text-white',
    hover: 'hover:border-magenta/60',
    hoverText: 'group-hover:text-magenta',
  },
  blue: {
    bg: 'bg-blue/5',
    border: 'border-blue/30',
    iconBg: 'bg-blue',
    iconText: 'text-white',
    hover: 'hover:border-blue/60',
    hoverText: 'group-hover:text-blue',
  },
  terracotta: {
    bg: 'bg-terracotta/5',
    border: 'border-terracotta/30',
    iconBg: 'bg-terracotta',
    iconText: 'text-white',
    hover: 'hover:border-terracotta/60',
    hoverText: 'group-hover:text-terracotta',
  },
  navy: {
    bg: 'bg-navy/5',
    border: 'border-navy/30',
    iconBg: 'bg-navy',
    iconText: 'text-white',
    hover: 'hover:border-navy/60',
    hoverText: 'group-hover:text-navy',
  },
  orange: {
    bg: 'bg-orange/5',
    border: 'border-orange/30',
    iconBg: 'bg-orange',
    iconText: 'text-white',
    hover: 'hover:border-orange/60',
    hoverText: 'group-hover:text-orange',
  },
};

export function SectionCard({
  title,
  description,
  href,
  icon: Icon,
  color,
  stats,
}: SectionCardProps) {
  const colors = colorClasses[color];

  return (
    <Link
      href={href}
      className={clsx(
        'group block bg-white rounded-xl border p-6 transition-all duration-200',
        'hover:shadow-lg hover:-translate-y-1',
        colors.border,
        colors.hover
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={clsx(
            'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200',
            'group-hover:scale-110',
            colors.iconBg,
            colors.iconText
          )}
        >
          <Icon className="w-7 h-7" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={clsx('text-lg font-bold text-navy transition-colors', colors.hoverText)}>
            {title}
          </h3>
          <p className="text-sm text-text-primary mt-1 leading-relaxed">{description}</p>
        </div>

        {/* Arrow */}
        <ArrowRight
          className={clsx(
            'w-5 h-5 text-text-primary flex-shrink-0 transition-all duration-200 group-hover:translate-x-1',
            colors.hoverText
          )}
        />
      </div>

      {/* Stats (if provided) */}
      {stats && stats.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div key={index}>
                <p className="text-xs text-text-primary/60 uppercase tracking-wide">{stat.label}</p>
                <p className="text-lg font-bold text-navy mt-0.5">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Link>
  );
}
