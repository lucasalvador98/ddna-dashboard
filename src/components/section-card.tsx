import Link from "next/link";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";

type SectionColor = "amber" | "magenta" | "blue" | "terracotta" | "navy" | "orange";

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
  { bg: string; border: string; iconBg: string; iconText: string; hover: string }
> = {
  amber: {
    bg: "bg-[#F3A712]/5",
    border: "border-[#F3A712]/30",
    iconBg: "bg-[#F3A712]",
    iconText: "text-[#00074E]",
    hover: "hover:border-[#F3A712]/60",
  },
  magenta: {
    bg: "bg-[#BF1363]/5",
    border: "border-[#BF1363]/30",
    iconBg: "bg-[#BF1363]",
    iconText: "text-white",
    hover: "hover:border-[#BF1363]/60",
  },
  blue: {
    bg: "bg-[#3777FF]/5",
    border: "border-[#3777FF]/30",
    iconBg: "bg-[#3777FF]",
    iconText: "text-white",
    hover: "hover:border-[#3777FF]/60",
  },
  terracotta: {
    bg: "bg-[#E07A5F]/5",
    border: "border-[#E07A5F]/30",
    iconBg: "bg-[#E07A5F]",
    iconText: "text-white",
    hover: "hover:border-[#E07A5F]/60",
  },
  navy: {
    bg: "bg-[#00074E]/5",
    border: "border-[#00074E]/30",
    iconBg: "bg-[#00074E]",
    iconText: "text-white",
    hover: "hover:border-[#00074E]/60",
  },
  orange: {
    bg: "bg-[#FF7F11]/5",
    border: "border-[#FF7F11]/30",
    iconBg: "bg-[#FF7F11]",
    iconText: "text-white",
    hover: "hover:border-[#FF7F11]/60",
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
        "group block bg-white rounded-xl border p-6 transition-all duration-200",
        "hover:shadow-lg hover:-translate-y-1",
        colors.border,
        colors.hover
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={clsx(
            "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200",
            "group-hover:scale-110",
            colors.iconBg,
            colors.iconText
          )}
        >
          <Icon className="w-7 h-7" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-[#00074E] group-hover:text-[#3777FF] transition-colors">
            {title}
          </h3>
          <p className="text-sm text-[#4D4D4D] mt-1 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Arrow */}
        <ArrowRight
          className={clsx(
            "w-5 h-5 text-[#4D4D4D] flex-shrink-0 transition-transform duration-200",
            "group-hover:translate-x-1 group-hover:text-[#3777FF]"
          )}
        />
      </div>

      {/* Stats (if provided) */}
      {stats && stats.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#E0E0E0]">
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div key={index}>
                <p className="text-xs text-[#4D4D4D]/60 uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="text-lg font-bold text-[#00074E] mt-0.5">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Link>
  );
}
