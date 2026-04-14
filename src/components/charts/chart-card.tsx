"use client";

import clsx from "clsx";

type ChartCardColor = "terracotta" | "amber" | "magenta" | "blue" | "navy" | "orange";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  color?: ChartCardColor;
}

const colorClasses: Record<ChartCardColor, string> = {
  terracotta: "#E07A5F",
  amber: "#F3A712",
  magenta: "#BF1363",
  blue: "#3777FF",
  navy: "#00074E",
  orange: "#FFB347",
};

export function ChartCard({
  title,
  subtitle,
  children,
  className,
  color = "blue",
}: ChartCardProps) {
  const accentColor = colorClasses[color];

  return (
    <section
      className={clsx(
        "bg-white rounded-xl border border-[#E0E0E0] overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-[#E0E0E0]">
        <div className="flex items-center gap-3">
          <div
            className="w-1 h-6 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
          <div>
            <h3 className="font-display text-lg text-[#00074E] tracking-tight">{title}</h3>
            {subtitle && (
              <p className="font-body text-sm text-[#4D4D4D] mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-6">{children}</div>
    </section>
  );
}
