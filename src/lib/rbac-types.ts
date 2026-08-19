export interface Role {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  permissions: RolePermission[];
}

export interface RolePermission {
  id: number;
  role_id: number;
  route: string;
  can_view: boolean;
  can_edit: boolean;
}

export interface UserRole {
  user_id: string;
  email: string;
  role_id: number;
  role_name: string;
  created_at: string;
}

// All available routes in the app
export const APP_ROUTES = [
  { route: '/admin', label: 'Administración' },
  { route: '/monitoreo', label: 'Monitoreo de Medios' },
  { route: '/repositorio', label: 'Repositorio' },
  { route: '/fuentes', label: 'Fuentes de Datos' },
  { route: '/formularios', label: 'Formularios' },
  { route: '/ejecutivo', label: 'Reporte Ejecutivo' },
  { route: '/presupuesto-nnya', label: 'Presupuesto NNyA' },
  { route: '/geo', label: 'Mapa Geo' },
  { route: '/salud', label: 'Salud' },
  { route: '/educacion', label: 'Educación' },
  { route: '/pobreza', label: 'Pobreza' },
  { route: '/seguridad', label: 'Seguridad' },
  { route: '/inversion', label: 'Inversión Social' },
] as const;
