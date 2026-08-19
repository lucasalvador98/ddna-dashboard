'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Shield, Users, Settings } from 'lucide-react';
import clsx from 'clsx';
import { LoginGate } from '@/components/login-gate';

const TABS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/roles', label: 'Roles', icon: Shield },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/config', label: 'Configuración', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <LoginGate>
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#334155] to-[#475569]">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="font-display text-2xl text-white">Panel de Administración</h1>
            <p className="text-sm text-white/60 mt-1">
              Gestión de acceso, usuarios y datos del sistema
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <nav className="flex gap-1 -mb-px">
              {TABS.map((tab) => {
                const isActive =
                  tab.href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={clsx(
                      'inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                      isActive
                        ? 'border-[#334155] text-[#334155]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Page content */}
        <div className="max-w-7xl mx-auto px-6 py-6">{children}</div>
      </div>
    </LoginGate>
  );
}
