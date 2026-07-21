import { Radio } from 'lucide-react';
import { LoginGate } from '@/components/login-gate';
import { SectionHeader } from '@/components/section-header';
import { MonitoreoClient } from './monitoreo-client';

export default function MonitoreoPage() {
  return (
    <LoginGate>
      <div className="min-h-screen">
        <SectionHeader
          icon={Radio}
          title="Monitoreo de Medios"
          description="Registro y seguimiento de noticias sobre NNyA en medios de Córdoba"
          color="navy"
        />
        <MonitoreoClient />
      </div>
    </LoginGate>
  );
}
