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
  { label: "Repositorio", href: "/repositorio", iconSrc: "/logos/Recurso 7@2x.png", iconAlt: "Repositorio DDNA" },
  
];

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
      {/* Gradient accent strip at top */}
      <div className="h-1.5 bg-gradient-to-r from-[#FF7F11] via-[#F3A712] to-[#FF7F11]" />
      
      {/* Logo Area */}
      <div className="flex items-center justify-center p-4 border-b border-[#E0E0E0]">
        <Image
          src="/logos/LOGO DDNA_HORIZONTAL_COLOR.png"
          alt="DDNA"
          width={isCollapsed ? 40 : 160}
          height={40}
          style={{ height: "auto" }}
          className="object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/" && pathname.startsWith(item.href));
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive
                      ? "bg-[#BF1363]/10 text-[#BF1363]"
                      : "text-[#4D4D4D] hover:bg-gray-100"
                  )}
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
                      style={{ width: "auto", height: "auto" }}
                      className={clsx(
                        "object-contain",
                        isActive ? "" : "opacity-60"
                      )}
                    />
                  </div>
                  {!isCollapsed && (
                    <span 
                      className={clsx(
                        "font-accent text-sm tracking-wide",
                        isActive ? "font-medium" : "text-[#4D4D4D]"
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

      {/* Collapse toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-[#E0E0E0] rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors shadow-sm"
        aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
      >
        <svg
          className={clsx("w-3 h-3 transition-transform", isCollapsed ? "rotate-180" : "")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Version/footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-[#E0E0E0]">
          <p className="font-accent text-xs text-gray-400 text-center">
            DDNA Dashboard v1.0
          </p>
        </div>
      )}
    </aside>
  );
}