export type FileCategory =
  | 'encuestas'
  | 'inversion'
  | 'consumos'
  | 'medios'
  | 'proteccion'
  | 'informes';

export type FileType = 'pdf' | 'xlsx' | 'docx';

export interface RepoFile {
  id: string;
  nombre_archivo: string;
  descripcion: string | null;
  categoria: string;
  tipo_documento: string;
  tamano_bytes: number | null;
  url_storage: string | null;
  fecha_subida: string;
  notas: string | null;
  processed: boolean;
  total_chunks: number;
}

export interface ProcessResult {
  id: string;
  nombre: string;
  status: 'pending' | 'processing' | 'done' | 'error' | 'skipped';
  chunks?: number;
  error?: string;
}

export const CATEGORIES: { value: FileCategory; label: string }[] = [
  { value: 'encuestas', label: 'Encuestas' },
  { value: 'inversion', label: 'Inversión' },
  { value: 'consumos', label: 'Consumos' },
  { value: 'medios', label: 'Medios' },
  { value: 'proteccion', label: 'Protección' },
  { value: 'informes', label: 'Informes' },
];

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.value, c.label]),
);

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  encuestas: { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-200' },
  inversion: { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-200' },
  proteccion: { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200' },
  consumos: { bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-200' },
  medios: { bg: 'bg-slate-50', text: 'text-slate-700', ring: 'ring-slate-200' },
  informes: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' },
};

export const FILE_TYPE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pdf: { bg: 'bg-red-50', text: 'text-red-600', label: 'PDF' },
  xlsx: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'XLSX' },
  docx: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'DOCX' },
};

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getFileType(tipo: string): FileType {
  const t = tipo.toLowerCase();
  if (t === 'pdf') return 'pdf';
  if (t === 'xlsx' || t === 'xls') return 'xlsx';
  return 'docx';
}

export function getStatus(file: RepoFile): {
  label: string;
  color: 'green' | 'amber' | 'gray';
  icon: 'check' | 'clock' | 'minus';
} {
  if (file.processed) {
    return { label: `${file.total_chunks} chunks`, color: 'green', icon: 'check' };
  }
  if (file.url_storage) {
    return { label: 'Pendiente', color: 'amber', icon: 'clock' };
  }
  return { label: 'Sin storage', color: 'gray', icon: 'minus' };
}
