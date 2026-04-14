import clsx from "clsx";

interface SectionHeaderProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: "amber" | "magenta" | "blue" | "terracotta" | "navy" | "orange";
}

const colorClasses = {
  amber: "bg-[#F3A712]",
  magenta: "bg-[#BF1363]",
  blue: "bg-[#3777FF]",
  terracotta: "bg-[#E07A5F]",
  navy: "bg-[#00074E]",
  orange: "bg-[#FF7F11]",
};

export function SectionHeader({ icon: Icon, title, description, color }: SectionHeaderProps) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div
        className={clsx(
          "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-white",
          colorClasses[color]
        )}
      >
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <h1 className="font-display text-2xl text-[#00074E] tracking-tight">{title}</h1>
        <p className="font-body text-sm text-[#4D4D4D] mt-1">{description}</p>
      </div>
    </div>
  );
}
