import clsx from 'clsx';

interface SectionHeaderProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: 'amber' | 'magenta' | 'blue' | 'terracotta' | 'navy' | 'orange' | 'green';
  as?: 'h1' | 'h2';
}

const colorClasses: Record<string, string> = {
  amber: 'bg-amber',
  magenta: 'bg-magenta',
  blue: 'bg-blue',
  terracotta: 'bg-terracotta',
  navy: 'bg-navy',
  orange: 'bg-orange',
  green: 'bg-[#10B981]',
};

export function SectionHeader({
  icon: Icon,
  title,
  description,
  color,
  as: Heading = 'h1',
}: SectionHeaderProps) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div
        className={clsx(
          'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-white',
          colorClasses[color]
        )}
      >
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <Heading className="font-display text-2xl text-navy tracking-tight">{title}</Heading>
        <p className="font-body text-sm text-text-primary mt-1">{description}</p>
      </div>
    </div>
  );
}
