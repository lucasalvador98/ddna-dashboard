"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Bell, Menu, X, Globe } from "lucide-react";
import clsx from "clsx";

const routeTitles: Record<string, string> = {
  "/": "Tablero General de Monitoreo",
  "/salud": "Indicadores de Salud",
  "/educacion": "Indicadores de Educación",
  "/pobreza": "Indicadores de Pobreza",
  "/seguridad": "Indicadores de Seguridad",
  "/inversion": "Inversión Social",
  "/fuentes": "Catálogo de Fuentes de Datos",
};

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const title = routeTitles[pathname] || "DDNA";

  const navLinks = [
    { label: "Inicio", href: "/" },
    { label: "Salud", href: "/salud" },
    { label: "Educación", href: "/educacion" },
    { label: "Pobreza", href: "/pobreza" },
    { label: "Seguridad", href: "/seguridad" },
    { label: "Inversión Social", href: "/inversion" },
    { label: "Fuentes de Datos", href: "/fuentes" },
  ];

  return (
    <header className="bg-white border-b border-[#E0E0E0] sticky top-0 z-40">
      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between px-6 py-4">
        {/* Breadcrumb / Title */}
        <div>
          <h1 className="font-display text-2xl text-[#00074E] tracking-tight">{title}</h1>
          <p className="font-body text-sm text-[#4D4D4D] mt-0.5">
            Defensoría de los Derechos de Niñas, Niños y Adolescentes
          </p>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#FDF3E7] transition-colors text-[#4D4D4D]"
              aria-label="Selector de idioma"
            >
              <Globe className="w-4 h-4" />
              <span className="font-body text-sm font-medium">ES</span>
            </button>
            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-[#E0E0E0] py-1 z-50">
                <button className="w-full px-4 py-2 text-left font-body text-sm hover:bg-[#FDF3E7] text-[#4D4D4D]">
                  Español
                </button>
                <button className="w-full px-4 py-2 text-left font-body text-sm hover:bg-[#FDF3E7] text-[#4D4D4D]">
                  English
                </button>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <button
            className="relative p-2 rounded-lg hover:bg-[#FDF3E7] transition-colors text-[#4D4D4D]"
            aria-label="Notificaciones"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#BF1363] rounded-full" />
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3">
        {/* Mobile Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/logos/Cba.png"
            alt="Córdoba"
            width={28}
            height={28}
            className="rounded-sm"
          />
          <Image
            src="/logos/LOGO DDNA_HORIZONTAL_COLOR.png"
            alt="DDNA"
            width={100}
            height={24}
            className="object-contain"
          />
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-[#FDF3E7] transition-colors text-[#4D4D4D]"
          aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <nav className="md:hidden border-t border-[#E0E0E0] bg-white">
          <ul className="py-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={clsx(
                    "block px-4 py-3 font-body text-sm transition-colors",
                    pathname === link.href
                      ? "bg-[#F3A712]/10 text-[#F3A712] font-medium border-l-4 border-[#F3A712]"
                      : "text-[#4D4D4D] hover:bg-[#FDF3E7]"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
