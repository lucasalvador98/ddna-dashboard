'use client';

// Conditional application chrome. Renders the dashboard shell
// (SidebarProvider + Header + Sidebar + main) for every route EXCEPT the
// standalone public forms under /f/, which render raw without any dashboard
// navigation. Decision from SDD design rev 2 — rejected a route-group
// refactor in favor of this single-file conditional.

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { SidebarProvider } from '@/components/sidebar-context';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  // Public forms are standalone: no dashboard chrome.
  if (pathname.startsWith('/f/')) {
    return <>{children}</>;
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#1a2556] focus:text-white focus:rounded-lg"
      >
        Saltar al contenido principal
      </a>
      <SidebarProvider>
        <Header />
        <div className="flex flex-1 min-h-0">
          <Sidebar />
          <main id="main-content" className="flex-1 overflow-y-auto p-6 lg:p-8">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}
