'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, X } from 'lucide-react';
import clsx from 'clsx';
import { navigation, findGroupForPath } from '@/lib/navigation';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());
  const pathname = usePathname();

  // Auto-expand the group that contains the current route
  useEffect(() => {
    const activeGroup = findGroupForPath(pathname);
    if (activeGroup) {
      setExpandedGroups(prev => {
        const next = new Set(prev);
        next.add(activeGroup);
        return next;
      });
    }
  }, [pathname]);

  // Close on route change
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

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

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 z-50 bg-black/40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={clsx(
          'fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-[#E0E0E0]">
          <span className="font-display text-lg text-[#334155]">Navegación</span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#FDF3E7] transition-colors text-[#4D4D4D]"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3" style={{ height: 'calc(100% - 4rem)' }}>
          <ul className="space-y-0.5">
            {navigation.map(group => {
              const isExpanded = expandedGroups.has(group.label);
              const isSingleItem = group.items.length === 1;
              const activeChild = group.items.find(item => isItemActive(item.href));

              // Single-item group: render as a direct link
              if (isSingleItem) {
                const item = group.items[0];
                const active = isItemActive(item.href);
                return (
                  <li key={group.label}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                        active
                          ? 'bg-[#E07A5F]/10 text-[#E07A5F]'
                          : 'text-[#4D4D4D] hover:bg-gray-100'
                      )}
                    >
                      <item.icon
                        className={clsx(
                          'w-5 h-5 flex-shrink-0',
                          active ? 'text-[#E07A5F]' : 'text-[#9CA3AF]'
                        )}
                      />
                      <span
                        className={clsx(
                          'font-accent text-sm tracking-wide',
                          active ? 'font-medium' : ''
                        )}
                      >
                        {item.label}
                      </span>
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
                  </button>

                  {isExpanded && (
                    <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-[#E0E0E0] pl-3">
                      {group.items.map(item => {
                        const active = isItemActive(item.href);
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={onClose}
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
      </div>
    </>
  );
}
