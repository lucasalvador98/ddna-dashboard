'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { LoginGate } from '@/components/login-gate';

const GeoMaps = dynamic(() => import('@/components/geo-maps'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
    </div>
  ),
});

export default function GeoPage() {
  return (
    <LoginGate>
      <GeoMaps />
    </LoginGate>
  );
}
