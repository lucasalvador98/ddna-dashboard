"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  iconSrc: string;
  iconAlt: string;
}

const navItems: NavItem[] = [
  { label: "Inicio", href: "/", iconSrc: "/logos/Recurso 1@2x.png", iconAlt: "Inicio" },
  { label: "Salud", href: "/salud", iconSrc: "/logos/Recurso 2@2x.png", iconAlt: "Salud" },
  { label: "Educación", href: "/educacion", iconSrc: "/logos/Recurso 3@2x.png", iconAlt: "Educación" },
  { label: "Pobreza", href: "/pobreza", iconSrc: "/logos/Recurso 4@2x.png", iconAlt: "Pobreza" },
  { label: "Seguridad", href: "/seguridad", iconSrc: "/logos/Recurso 5@2x.png", iconAlt: "Seguridad" },
  { label: "Inversión Social", href: "/inversion", iconSrc: "/logos/Recurso 6@2x.png", iconAlt: "Inversión Social" },
  { label: "Fuentes de Datos", href: "/fuentes", iconSrc: "/logos/Recurso 7@2x.png", iconAlt: "Fuentes de Datos" },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        "hidden md:flex flex-col bg-[#00074E] text-white transition-all duration-300 ease-in-out relative overflow-hidden",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00074E] via-[#00074E] to-[#00074E] pointer-events-none" />
      
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#F3A712]/10 to-transparent pointer-events-none" />
      
      {/* Logo Area */}
      <div className="relative z-10 flex items-center justify-between p-4 border-b border-[#F3A712]/30">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Image
              src="/logos/Cba.png"
              alt="Gobierno de Córdoba"
              width={32}
              height={32}
              className="rounded-sm"
            />
            <Image
              src="/logos/LOGO DDNA_HORIZONTAL_COLOR.png"
              alt="DDNA"
              width={140}
              height={32}
              className="object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>
        )}
        {isCollapsed && (
          <Image
            src="/logos/Cba.png"
            alt="Córdoba"
            width={32}
            height={32}
            className="rounded-sm mx-auto"
          />
        )}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    "hover:bg-[#F3A712]/20",
                    isActive
                      ? "bg-[#F3A712] text-[#00074E] shadow-md"
                      : "text-[#FFE2BF] hover:text-white"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className={clsx(
                    "flex-shrink-0 w-6 h-6 relative",
                    isCollapsed ? "mx-auto" : ""
                  )}>
                    <Image
                      src={item.iconSrc}
                      alt={item.iconAlt}
                      width={24}
                      height={24}
                      className={clsx(
                        "object-contain",
                        isActive ? "brightness-0 invert" : "brightness-0 invert opacity-70 hover:opacity-100"
                      )}
                    />
                  </div>
                  {!isCollapsed && (
                    <span 
                      className={clsx(
                        "font-accent text-sm tracking-wide",
                        isActive ? "font-medium" : ""
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="relative z-10 p-4 border-t border-[#F3A712]/30">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={clsx(
            "flex items-center gap-2 text-[#FFE2BF] hover:text-white transition-colors",
            "mx-auto",
            isCollapsed ? "px-2 py-2" : "px-3 py-2"
          )}
          aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="font-accent text-sm">Colapsar</span>
            </>
          )}
        </button>
      </div>

      {/* Version */}
      {!isCollapsed && (
        <div className="relative z-10 px-4 pb-4">
          <p className="font-accent text-xs text-[#FFE2BF]/60 text-center">
            v0.1.0
          </p>
        </div>
      )}
    </aside>
  );
}
