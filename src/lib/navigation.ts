import {
  Home,
  Heart,
  HeartPulse,
  BookOpen,
  ClipboardList,
  Users,
  Shield,
  Coins,
  Map,
  Database,
  FolderOpen,
  FileText,
  Settings,
  Newspaper,
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
    color: '#FF8C00',
    items: [{ label: 'Tablero General', href: '/', icon: Home }],
  },
  {
    label: 'Salud',
    icon: Heart,
    color: '#C2410C',
    items: [
      { label: 'Indicadores', href: '/salud', icon: Heart },
      { label: 'Adolescente', href: '/salud-adolescente', icon: HeartPulse },
    ],
  },
  {
    label: 'Educación',
    icon: BookOpen,
    color: '#FF8C00',
    items: [{ label: 'Educación', href: '/educacion', icon: BookOpen }],
  },
  {
    label: 'Condiciones Sociales',
    icon: Users,
    color: '#8A4B4B',
    items: [
      { label: 'Pobreza e Indigencia', href: '/pobreza', icon: Users },
      { label: 'Encuestas 2024', href: '/encuestas', icon: ClipboardList },
      { label: 'Infancias', href: '/infancias', icon: Users },
    ],
  },
  {
    label: 'Seguridad',
    icon: Shield,
    color: '#165DFF',
    items: [{ label: 'Justicia', href: '/seguridad', icon: Shield }],
  },
  {
    label: 'Inversión Social',
    icon: Coins,
    color: '#C2410C',
    items: [{ label: 'Presupuesto NNyA', href: '/inversion', icon: Coins }],
  },
  {
    label: 'Monitoreo',
    icon: Newspaper,
    color: '#6B4A9C',
    items: [{ label: 'Monitoreo de Medios', href: '/monitoreo', icon: Newspaper }],
  },
  {
    label: 'Documentos',
    icon: FolderOpen,
    color: '#356B6B',
    items: [
      { label: 'Repositorio', href: '/repositorio', icon: FolderOpen },
      { label: 'Informe Ejecutivo', href: '/ejecutivo', icon: FileText },
    ],
  },
  {
    label: 'Datos',
    icon: Database,
    color: '#356B6B',
    items: [
      { label: 'Mapas', href: '/geo', icon: Map },
      { label: 'Fuentes de Datos', href: '/fuentes', icon: Database },
    ],
  },
  {
    label: 'Formularios',
    icon: ClipboardList,
    color: '#FF8C00',
    items: [{ label: 'Formularios', href: '/formularios', icon: ClipboardList }],
  },
  {
    label: 'Admin',
    icon: Settings,
    color: '#5B5755',
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
  '/monitoreo': 'Monitoreo de Medios',
  '/formularios': 'Formularios',
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
