'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, ChevronRight, LogOut } from 'lucide-react';
import { routeTitles } from '@/lib/navigation';
import { useSidebar } from '@/components/sidebar-context';
import { useAuth } from '@/components/auth-provider';
import { MobileNav } from '@/components/mobile-nav';

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
  const { user, signOut } = useAuth();

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
            width={150}
            height={40}
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

        {/* User section — only visible when authenticated */}
        {user && (
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs text-gray-400 hidden lg:inline">{user.email}</span>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        )}
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

      {/* Mobile Navigation Drawer */}
      <MobileNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </header>
  );
}
