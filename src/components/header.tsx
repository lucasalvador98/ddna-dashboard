'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, Menu, X, Globe, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { navigation, routeTitles } from '@/lib/navigation';
import { useSidebar } from '@/components/sidebar-context';

// Build flat nav links from grouped navigation for mobile menu
const navLinks = navigation.flatMap(group =>
  group.items.map(item => ({
    label: item.label,
    href: item.href,
    group: group.label,
  }))
);

function Breadcrumb() {
  const pathname = usePathname();
  if (pathname === '/') return null;

  const segments = pathname.split('/').filter(Boolean);
  const crumbs = segments.map((seg, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/');
    const title = routeTitles[href] || seg;
    const isLast = i === segments.length - 1;
    return { href, title, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-[#9CA3AF]">
      <Link href="/" className="hover:text-[#E07A5F] transition-colors">
        Inicio
      </Link>
      {crumbs.map(crumb => (
        <span key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="w-3 h-3" />
          {crumb.isLast ? (
            <span className="text-[#1a2556] font-medium">{crumb.title}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-[#E07A5F] transition-colors">
              {crumb.title}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

export function Header() {
  const pathname = usePathname();
  const { toggleCollapse, isCollapsed } = useSidebar();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const title = routeTitles[pathname] || 'DDNA';

  return (
    <header className="bg-white border-b border-[#E0E0E0] sticky top-0 z-40">
      {/* Single gradient accent strip — now only here */}
      <div className="h-1.5 bg-gradient-to-r from-[#FF7F11] via-[#F3A712] to-[#FF7F11]" />

      {/* Desktop Header */}
      <div className="hidden md:flex items-center gap-3 px-6 lg:px-8 py-3">
        {/* Hamburger — toggle sidebar collapse */}
        <button
          onClick={toggleCollapse}
          className="p-2 -ml-2 rounded-lg hover:bg-[#FDF3E7] transition-colors text-[#4D4D4D]"
          aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* DDNA Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logos/LOGO DDNA_HORIZONTAL_COLOR.png"
            alt="DDNA"
            width={110}
            height={30}
            style={{ height: 'auto' }}
            className="object-contain"
            priority
          />
        </Link>

        {/* Page title + breadcrumb — hidden on homepage to avoid duplication */}
        {pathname !== '/' && (
          <>
            <div className="w-px h-6 bg-[#E0E0E0]" />
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-xl text-[#1a2556] tracking-tight truncate">
                {title}
              </h1>
              <Breadcrumb />
            </div>
          </>
        )}

        {/* Right Side Controls */}
        <div className="flex items-center gap-2">
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
      <div className="md:hidden flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <Image
            src="/logos/Cba.png"
            alt="Córdoba"
            width={28}
            height={28}
            style={{ height: 'auto' }}
            className="rounded-sm"
          />
          <Image
            src="/logos/LOGO DDNA_HORIZONTAL_COLOR.png"
            alt="DDNA"
            width={100}
            height={24}
            style={{ height: 'auto' }}
            className="object-contain"
          />
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-[#FDF3E7] transition-colors text-[#4D4D4D]"
          aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <nav className="md:hidden border-t border-[#E0E0E0] bg-white max-h-[70vh] overflow-y-auto">
          <ul className="py-2">
            {navLinks.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={clsx(
                    'block px-4 py-3 font-body text-sm transition-colors',
                    pathname === link.href
                      ? 'bg-[#E07A5F]/10 text-[#E07A5F] font-medium border-l-4 border-[#E07A5F]'
                      : 'text-[#4D4D4D] hover:bg-[#FDF3E7]'
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
