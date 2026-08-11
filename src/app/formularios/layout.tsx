'use client';

import { LoginGate } from '@/components/login-gate';

export default function FormulariosLayout({ children }: { children: React.ReactNode }) {
  return (
    <LoginGate>
      <div className="min-h-screen">{children}</div>
    </LoginGate>
  );
}
