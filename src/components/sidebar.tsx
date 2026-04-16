"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";

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
  { label: "Inversión", href: "/inversion", iconSrc: "/logos/Recurso 6@2x.png", iconAlt: "Inversión Social" },
  { label: "Fuentes", href: "/fuentes", iconSrc: "/logos/Recurso 7@2x.png", iconAlt: "Fuentes de Datos" },
];

// Section colors for active states
const sectionColors: Record<string, string> = {
  "/": "#F3A712",      // Inicio - amber
  "/salud": "#E07A5F", // Salud - terracotta
  "/educacion": "#F3A712", // Educación - amber
  "/pobreza": "#BF1363", // Pobreza - magenta
  "/seguridad": "#3777FF", // Seguridad - blue
  "/inversion": "#FF7F11", // Inversión - orange
};

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        "hidden md:flex flex-col bg-white border-r border-[#E0E0E0] transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-20" : "w-56"
      )}
    >
      {/* Orange accent strip at top */}
      <div className="h-1 bg-[#FF7F11]" />
      
      {/* Logo Area */}
      <div className="flex items-center justify-center p-4 border-b border-[#E0E0E0]">
        <Image
          src="/logos/LOGO DDNA_HORIZONTAL_COLOR.png"
          alt="DDNA"
          width={isCollapsed ? 40 : 160}
          height={40}
          className="object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const activeColor = sectionColors[item.href] || "#F3A712";

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    isActive
                      ? "font-medium shadow-sm"
                      : "hover:bg-gray-50"
                  )}
                  style={isActive ? {
                    backgroundColor: `${activeColor}15`,
                    borderLeft: `3px solid ${activeColor}`,
                    paddingLeft: '9px'
                  } : undefined}
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
                        isActive ? "" : "opacity-60"
                      )}
                      style={isActive ? { filter: `brightness(0) saturate(100%) invert(41%) saturate(3000%) hue-rotate(340deg) brightness(100%)` } : undefined}
                    />
                  </div>
                  {!isCollapsed && (
                    <span 
                      className={clsx(
                        "font-accent text-sm tracking-wide",
                        isActive ? "font-medium" : "text-[#4D4D4D]"
                      )}
                      style={isActive ? { color: activeColor } : undefined}
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
      <div className="p-4 border-t border-[#E0E0E0]">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={clsx(
            "w-full flex items-center justify-center gap-2 text-[#4D4D4D] hover:text-[#FF7F11] transition-colors py-2 rounded-lg hover:bg-gray-50",
          )}
          aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {isCollapsed ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
              <span className="font-accent text-sm">Colapsar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
