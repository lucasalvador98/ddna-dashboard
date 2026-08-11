'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertCircle, FileText, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { CATEGORIES, formatBytes, getFileType, FILE_TYPE_COLORS } from '@/lib/repositorio';

interface Props {
  onUploaded?: () => void;
}

export function RepoUploadZone({ onUploaded }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [categoria, setCategoria] = useState('informes');
  const [descripcion, setDescripcion] = useState('');
  const [notas, setNotas] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const accepted = '.pdf,.xlsx,.xls,.docx,.doc';
  const acceptList = accepted.split(',');

  const isAccepted = (f: File) => {
    const lower = f.name.toLowerCase();
    return acceptList.some(ext => lower.endsWith(ext));
  };

  const handleFile = useCallback((f: File) => {
    setError('');
    setSuccess('');
    if (!isAccepted(f)) {
      setError('Tipo no soportado. Solo PDF, XLSX o DOCX.');
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setError('El archivo supera 50 MB.');
      return;
    }
    setFile(f);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const reset = () => {
    setFile(null);
    setDescripcion('');
    setNotas('');
    setError('');
    setSuccess('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('categoria', categoria);
    formData.append('descripcion', descripcion);
    formData.append('notas', notas);

    try {
      const res = await fetch('/api/repositorio/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Error al subir');
      } else {
        setSuccess(`"${file.name}" subido correctamente.`);
        reset();
        onUploaded?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  };

  const ext = file?.name.split('.').pop() ?? '';
  const fileType = ext ? getFileType(ext) : 'docx';
  const fileColors = FILE_TYPE_COLORS[fileType] ?? FILE_TYPE_COLORS.docx;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h3 className="font-accent text-base text-[#334155] mb-3 flex items-center gap-2">
        <Upload className="w-4 h-4" />
        Subir nuevo archivo
      </h3>

      {!file ? (
        <div
          onDragOver={e => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={clsx(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
            dragOver
              ? 'border-[#334155] bg-[#334155]/5'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
          )}
        >
          <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-xl flex items-center justify-center">
            <Upload className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 font-medium">Arrastrá un PDF, XLSX o DOCX</p>
          <p className="text-xs text-gray-400 mt-1">o hacé click para seleccionar</p>
          <input
            ref={inputRef}
            type="file"
            accept={accepted}
            onChange={onSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {/* File preview */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div
              className={clsx(
                'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                fileColors.bg,
              )}
            >
              <FileText className={clsx('w-5 h-5', fileColors.text)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#334155] truncate">{file.name}</p>
              <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg"
              title="Quitar archivo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Metadata fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">
                Categoría
              </label>
              <select
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#334155] focus:border-transparent outline-none bg-white"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">
                Descripción
              </label>
              <input
                type="text"
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                placeholder="Descripción breve"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#334155] focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">
              Notas
            </label>
            <input
              type="text"
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Notas adicionales (opcional)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#334155] focus:border-transparent outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={reset}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="flex items-center gap-2 px-5 py-2 bg-[#334155] text-white rounded-lg text-sm font-medium hover:bg-[#0F172A] disabled:opacity-50 transition-colors"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {uploading ? 'Subiendo...' : 'Subir archivo'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </p>
      )}
      {success && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-emerald-600">
          <CheckCircle className="w-4 h-4 shrink-0" /> {success}
        </p>
      )}
    </div>
  );
}
