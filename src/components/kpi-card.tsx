import { TrendingUp, TrendingDown } from "lucide-react";
import clsx from "clsx";

type KpiColor = "amber" | "magenta" | "blue" | "terracotta" | "navy" | "orange" | "green";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  color: KpiColor;
}

const colorClasses: Record<KpiColor, { border: string; iconBg: string; iconText: string }> = {
  amber: {
    border: "border-l-[#F3A712]",
    iconBg: "bg-[#F3A712]/10",
    iconText: "text-[#F3A712]",
  },
  magenta: {
    border: "border-l-[#BF1363]",
    iconBg: "bg-[#BF1363]/10",
    iconText: "text-[#BF1363]",
  },
  blue: {
    border: "border-l-[#3777FF]",
    iconBg: "bg-[#3777FF]/10",
    iconText: "text-[#3777FF]",
  },
  terracotta: {
    border: "border-l-[#E07A5F]",
    iconBg: "bg-[#E07A5F]/10",
    iconText: "text-[#E07A5F]",
  },
  navy: {
    border: "border-l-[#00074E]",
    iconBg: "bg-[#00074E]/10",
    iconText: "text-[#00074E]",
  },
  orange: {
    border: "border-l-[#FF7F11]",
    iconBg: "bg-[#FF7F11]/10",
    iconText: "text-[#FF7F11]",
  },
  green: {
    border: "border-l-[#10B981]",
    iconBg: "bg-[#10B981]/10",
    iconText: "text-[#10B981]",
  },
};

export function KpiCard({
  title,
  value,
  subtitle,
  change,
  changeType = "neutral",
  icon: Icon,
  color,
}: KpiCardProps) {
  const colors = colorClasses[color];

  return (
    <article
      className={clsx(
        "bg-white rounded-xl border border-[#E0E0E0] border-l-4 p-5",
        "transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:shadow-lg",
        colors.border
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Icon */}
        <div
          className={clsx(
            "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
            colors.iconBg
          )}
        >
          <Icon className={clsx("w-6 h-6", colors.iconText)} />
        </div>

        {/* Change Indicator */}
        {change && (
          <div
            className={clsx(
              "flex items-center gap-1 text-sm font-body font-medium px-2 py-1 rounded-full",
              changeType === "up" && "bg-[#22C55E]/10 text-[#22C55E]",
              changeType === "down" && "bg-[#EF4444]/10 text-[#EF4444]",
              changeType === "neutral" && "bg-[#E0E0E0]/50 text-[#4D4D4D]"
            )}
          >
            {changeType === "up" && <TrendingUp className="w-4 h-4" />}
            {changeType === "down" && <TrendingDown className="w-4 h-4" />}
            <span>{change}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-4">
        <h3 className="font-accent text-sm text-[#4D4D4D] tracking-wide">{title}</h3>
        <p className="font-display text-4xl text-[#00074E] mt-1">{value}</p>
        <p className="font-body text-sm text-[#4D4D4D]/70 mt-2 leading-relaxed">
          {subtitle}
        </p>
      </div>
    </article>
  );
}
