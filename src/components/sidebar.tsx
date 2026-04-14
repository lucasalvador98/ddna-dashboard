"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Home,
  Heart,
  BookOpen,
  Users,
  Shield,
  Coins,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Inicio", href: "/", icon: Home },
  { label: "Salud", href: "/salud", icon: Heart },
  { label: "Educación", href: "/educacion", icon: BookOpen },
  { label: "Pobreza", href: "/pobreza", icon: Users },
  { label: "Seguridad", href: "/seguridad", icon: Shield },
  { label: "Inversión Social", href: "/inversion", icon: Coins },
  { label: "Fuentes de Datos", href: "/fuentes", icon: FileText },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        "hidden md:flex flex-col bg-[#00074E] text-white transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Area */}
      <div className="flex items-center justify-between p-4 border-b border-[#3777FF]/30">
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
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    "hover:bg-[#3777FF]/20",
                    isActive
                      ? "bg-[#3777FF] text-white shadow-md"
                      : "text-[#A7DBF9] hover:text-white"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={clsx(
                      "flex-shrink-0",
                      isCollapsed ? "w-5 h-5" : "w-5 h-5"
                    )}
                  />
                  {!isCollapsed && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-[#3777FF]/30">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={clsx(
            "flex items-center gap-2 text-[#A7DBF9] hover:text-white transition-colors",
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
              <span className="text-sm">Colapsar</span>
            </>
          )}
        </button>
      </div>

      {/* Version */}
      {!isCollapsed && (
        <div className="px-4 pb-4">
          <p className="text-xs text-[#A7DBF9]/60 text-center">
            v0.1.0
          </p>
        </div>
      )}
    </aside>
  );
}
