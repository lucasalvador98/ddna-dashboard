'use client';

import { useState, useCallback } from 'react';
import { Users, Shield } from 'lucide-react';
import clsx from 'clsx';
import { UserRoleManager } from './admin-user-roles';
import { RoleManager } from './admin-role-manager';

type Tab = 'users' | 'roles';

const TABS = [
  { key: 'users' as Tab, label: 'Usuarios', icon: Users },
  { key: 'roles' as Tab, label: 'Roles', icon: Shield },
];

interface UsersRolesManagerProps {
  onFlash: (type: 'ok' | 'err', text: string) => void;
}

export function UsersRolesManager({ onFlash }: UsersRolesManagerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('users');

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.key
                  ? 'border-navy text-navy'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'users' ? (
        <UserRoleManager onFlash={onFlash} />
      ) : (
        <RoleManager onFlash={onFlash} />
      )}
    </div>
  );
}
