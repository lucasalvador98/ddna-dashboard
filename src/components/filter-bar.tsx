'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import clsx from 'clsx';

const EJES = [
  { value: 'todos', label: 'Todos los ejes' },
  { value: 'pobreza', label: 'Pobreza' },
  { value: 'salud', label: 'Salud' },
  { value: 'educacion', label: 'Educación' },
  { value: 'inversion', label: 'Inversión' },
  { value: 'seguridad', label: 'Seguridad' },
] as const;

export function FilterBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const current = searchParams.get('eje') || 'todos';

  const setEje = (eje: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (eje === 'todos') params.delete('eje');
    else params.set('eje', eje);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {EJES.map((eje) => (
        <button
          key={eje.value}
          onClick={() => setEje(eje.value)}
          className={clsx(
            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
            current === eje.value
              ? 'bg-[var(--ddna-blue)] text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          {eje.label}
        </button>
      ))}
    </div>
  );
}
