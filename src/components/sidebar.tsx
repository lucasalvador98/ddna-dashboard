'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';
import { navigation, findGroupForPath } from '@/lib/navigation';
import { useSidebar } from '@/components/sidebar-context';

interface SidebarProps {
  badges?: {
    repoPending: number;
    formsActive: number;
  } | null;
}

export function Sidebar({ badges }: SidebarProps) {
  const { isCollapsed, toggleCollapse } = useSidebar();
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());
  const pathname = usePathname();

  useEffect(() => {
    const activeGroup = findGroupForPath(pathname);
    if (activeGroup) {
      // Sync expanded state to pathname — intentional
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExpandedGroups(prev => {
        const next = new Set(prev);
        next.add(activeGroup);
        return next;
      });
    }
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const isItemActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  const badgeForHref = (href: string): number | null => {
    if (!badges) return null;
    if (href === '/repositorio') return badges.repoPending;
    if (href === '/formularios') return badges.formsActive;
    return null;
  };

  return (
    <aside
      className={clsx(
        'hidden sm:flex flex-col bg-white border-r border-[#E0E0E0] transition-all duration-300 ease-in-out relative shrink-0',
        isCollapsed ? 'w-14 sm:w-16' : 'w-60'
      )}
    >
      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <ul className="space-y-0.5 px-2">
          {navigation.map(group => {
            const isExpanded = expandedGroups.has(group.label);
            const isSingleItem = group.items.length === 1;
            const activeChild = group.items.find(item => isItemActive(item.href));

            // Single-item group: render as a direct link
            if (isSingleItem) {
              const item = group.items[0];
              const active = isItemActive(item.href);
              const count = badgeForHref(item.href);
              return (
                <li key={group.label}>
                  <Link
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                      active ? 'bg-[#E07A5F]/10 text-[#E07A5F]' : 'text-[#4D4D4D] hover:bg-gray-100'
                    )}
                  >
                    <item.icon
                      className={clsx(
                        'w-5 h-5 flex-shrink-0',
                        active ? 'text-[#E07A5F]' : 'text-[#9CA3AF]'
                      )}
                    />
                    {!isCollapsed && (
                      <span
                        className={clsx(
                          'font-accent text-sm tracking-wide',
                          active ? 'font-medium' : ''
                        )}
                      >
                        {item.label}
                      </span>
                    )}
                    {!isCollapsed && count != null && count > 0 && (
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                        {count}
                      </span>
                    )}
                  </Link>
                </li>
              );
            }

            // Multi-item group: collapsible
            return (
              <li key={group.label}>
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left',
                    activeChild
                      ? 'bg-[#E07A5F]/10 text-[#E07A5F]'
                      : 'text-[#4D4D4D] hover:bg-gray-100'
                  )}
                >
                  <group.icon
                    className={clsx(
                      'w-5 h-5 flex-shrink-0',
                      activeChild ? 'text-[#E07A5F]' : 'text-[#9CA3AF]'
                    )}
                  />
                  {!isCollapsed && (
                    <>
                      <span
                        className={clsx(
                          'font-accent text-sm tracking-wide flex-1',
                          activeChild ? 'font-medium' : ''
                        )}
                      >
                        {group.label}
                      </span>
                      <ChevronDown
                        className={clsx(
                          'w-4 h-4 transition-transform duration-200',
                          isExpanded ? 'rotate-0' : '-rotate-90'
                        )}
                      />
                    </>
                  )}
                </button>

                {/* Children */}
                {!isCollapsed && isExpanded && (
                  <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-[#E0E0E0] pl-3">
                    {group.items.map(item => {
                      const active = isItemActive(item.href);
                      const count = badgeForHref(item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={clsx(
                              'flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-sm',
                              active
                                ? 'bg-[#E07A5F]/10 text-[#E07A5F] font-medium'
                                : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#4D4D4D]'
                            )}
                          >
                            <item.icon
                              className={clsx(
                                'w-4 h-4 flex-shrink-0',
                                active ? 'text-[#E07A5F]' : 'text-[#D1D5DB]'
                              )}
                            />
                            <span className="font-accent tracking-wide">{item.label}</span>
                            {count != null && count > 0 && (
                              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                                {count}
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-3 w-6 h-6 bg-white border border-[#E0E0E0] rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors shadow-sm"
        aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
      >
        <ChevronLeft
          className={clsx('w-3 h-3 transition-transform', isCollapsed ? 'rotate-180' : '')}
        />
      </button>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <p className="font-accent text-xs text-gray-400 text-center">Defensoría de NNyA · Córdoba</p>
        </div>
      )}
    </aside>
  );
}
