import {
  Home,
  Heart,
  HeartPulse,
  BookOpen,
  GraduationCap,
  ClipboardList,
  Users,
  Shield,
  Coins,
  Map,
  Database,
  FolderOpen,
  FileText,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  icon: LucideIcon;
  color: string;
  items: NavItem[];
}

export const navigation: NavGroup[] = [
  {
    label: 'Inicio',
    icon: Home,
    color: '#F3A712',
    items: [{ label: 'Tablero General', href: '/', icon: Home }],
  },
  {
    label: 'Salud',
    icon: Heart,
    color: '#E07A5F',
    items: [
      { label: 'Indicadores', href: '/salud', icon: Heart },
      { label: 'Adolescente', href: '/salud-adolescente', icon: HeartPulse },
    ],
  },
  {
    label: 'Educación',
    icon: BookOpen,
    color: '#F3A712',
    items: [
      { label: 'Indicadores', href: '/educacion', icon: BookOpen },
    ],
  },
  {
    label: 'Condiciones Sociales',
    icon: Users,
    color: '#BF1363',
    items: [
      { label: 'Pobreza e Indigencia', href: '/pobreza', icon: Users },
      { label: 'Encuestas 2024', href: '/encuestas', icon: ClipboardList },
      { label: 'Infancias', href: '/infancias', icon: Users },
    ],
  },
  {
    label: 'Seguridad',
    icon: Shield,
    color: '#3777FF',
    items: [{ label: 'Justicia', href: '/seguridad', icon: Shield }],
  },
  {
    label: 'Inversión Social',
    icon: Coins,
    color: '#E07A5F',
    items: [{ label: 'Presupuesto NNyA', href: '/inversion', icon: Coins }],
  },
  {
    label: 'Herramientas',
    icon: Map,
    color: '#3599B8',
    items: [
      { label: 'Mapas', href: '/geo', icon: Map },
      { label: 'Repositorio', href: '/repositorio', icon: FolderOpen },
      { label: 'Fuentes de Datos', href: '/fuentes', icon: Database },
      { label: 'Informe Ejecutivo', href: '/ejecutivo', icon: FileText },
    ],
  },
  {
    label: 'Admin',
    icon: Settings,
    color: '#5F6B6D',
    items: [{ label: 'Configuración', href: '/admin', icon: Settings }],
  },
];

export const routeTitles: Record<string, string> = {
  '/': 'Tablero General de Monitoreo',
  '/salud': 'Indicadores de Salud',
  '/salud-adolescente': 'Salud Adolescente',
  '/educacion': 'Indicadores de Educación',

  '/encuestas': 'Encuestas 2024',
  '/pobreza': 'Indicadores de Pobreza',
  '/infancias': 'Infancias — Barómetro UCA',
  '/seguridad': 'Indicadores de Seguridad',
  '/inversion': 'Inversión Social',
  '/geo': 'Mapas',
  '/fuentes': 'Catálogo de Fuentes y APIs',
  '/repositorio': 'Repositorio Documental',
  '/repositorio/chat': 'Chat con la Bibliografía',
  '/ejecutivo': 'Informe Ejecutivo',
  '/admin': 'Configuración',
  '/apis': 'APIs',
};

/** Find which group a route belongs to (for auto-expanding sidebar) */
export function findGroupForPath(pathname: string): string | null {
  for (const group of navigation) {
    for (const item of group.items) {
      if (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))) {
        return group.label;
      }
    }
  }
  return null;
}
