'use client';

import { useSearchParams } from 'next/navigation';

export function useFilterPersist() {
  const searchParams = useSearchParams();
  const eje = searchParams.get('eje') || 'todos';
  const categoria = searchParams.get('categoria') || null;
  return { eje, categoria, searchParams };
}
