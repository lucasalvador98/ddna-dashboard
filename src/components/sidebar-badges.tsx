'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type RouteKey = '/monitoreo' | '/repositorio' | '/formularios';

async function fetchCounts(): Promise<Record<RouteKey, number>> {
  const anon = supabase;

  const [repoRes, formRes] = await Promise.allSettled([
    anon
      .from('repositorio')
      .select('*', { count: 'exact', head: true })
      .eq('processed', false)
      .not('url_storage', 'is', null),
    anon
      .from('formularios')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true),
  ]);

  const repoPending =
    repoRes.status === 'fulfilled' && !repoRes.value.error ? (repoRes.value.count ?? 0) : 0;
  const formsActive =
    formRes.status === 'fulfilled' && !formRes.value.error ? (formRes.value.count ?? 0) : 0;

  return { '/repositorio': repoPending, '/formularios': formsActive, '/monitoreo': 0 };
}

export interface SidebarCounts {
  repoPending: number;
  formsActive: number;
}

interface Props {
  children: (counts: SidebarCounts | null) => React.ReactNode;
}

export function SidebarBadges({ children }: Props) {
  const [counts, setCounts] = useState<SidebarCounts | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCounts().then(data => {
      const result: SidebarCounts = {
        repoPending: data['/repositorio'],
        formsActive: data['/formularios'],
      };
      if (!cancelled) setCounts(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return <>{children(counts)}</>;
}
