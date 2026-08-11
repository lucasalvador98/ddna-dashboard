'use client';

// Builder orchestrator (edit and create modes). Holds the definition in state
// and applies pure helpers from src/lib/formularios/builder.ts on every edit.
// Save validates with `validateDefinition` and persists via the admin server
// actions. Live preview renders the shared FormRenderer. UI strings Spanish.

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Eye, EyeOff, Save, XCircle } from 'lucide-react';
import clsx from 'clsx';
import type { CampoFormulario, DefinicionFormulario, ReglaLogica, TipoCampo } from '@/lib/formularios/types';
import { MAX_FIELDS } from '@/lib/formularios/defaults';
import { slugify } from '@/lib/formularios/slug';
import { validateDefinition } from '@/lib/formularios/validation';
import { addField, moveField, removeField, updateField } from '@/lib/formularios/builder';
import { createForm, updateForm } from '@/lib/actions/formularios';
import { TextInput } from '@/components/monitoreo/text-input';
import { FieldTypePicker } from '@/components/formularios/builder/field-type-picker';
import { FieldEditor } from '@/components/formularios/builder/field-editor';
import { BuilderPreview } from '@/components/formularios/builder/builder-preview';

interface BuilderClientProps {
  formId?: string;
  initialTitulo: string;
  initialDescripcion: string;
  initialSlug: string;
  initialDefinicion: DefinicionFormulario;
}

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

function Toast({ toast }: { toast: ToastState }) {
  return (
    <div
      className={clsx(
        'fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium',
        toast.type === 'success'
          ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          : 'bg-red-50 border border-red-200 text-red-800'
      )}
    >
      {toast.type === 'success' ? (
        <CheckCircle className="w-4 h-4 flex-shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 flex-shrink-0" />
      )}
      {toast.message}
    </div>
  );
}

export function BuilderClient({
  formId,
  initialTitulo,
  initialDescripcion,
  initialSlug,
  initialDefinicion,
}: BuilderClientProps) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(initialTitulo);
  const [descripcion, setDescripcion] = useState(initialDescripcion);
  const [slug, setSlug] = useState(initialSlug);
  const [slugTouched, setSlugTouched] = useState(Boolean(initialSlug));
  const [def, setDef] = useState(initialDefinicion);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  function handleTituloChange(value: string) {
    setTitulo(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleLogicChange(logic: ReglaLogica[]) {
    setDef((d) => ({ ...d, logic }));
  }

  async function handleSave() {
    if (saving) return;
    const validation = validateDefinition(def);
    if (!validation.valid) {
      setToast({ message: validation.errors.join(' '), type: 'error' });
      return;
    }

    setSaving(true);
    const input = {
      titulo,
      descripcion: descripcion.trim() || null,
      slug,
      definicion: def,
    };
    const result = formId ? await updateForm(formId, input) : await createForm(input);
    setSaving(false);

    if (!result.ok) {
      setToast({ message: result.error, type: 'error' });
      return;
    }

    router.refresh();
    if (!formId) {
      router.push('/formularios');
    } else {
      setToast({ message: 'Formulario guardado.', type: 'success' });
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="bg-gradient-to-r from-[#1a2556] to-[#2a3570] rounded-xl px-6 py-6 mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-white">
            {formId ? 'Editar formulario' : 'Nuevo formulario'}
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Definí los campos y las reglas de visibilidad
          </p>
        </div>
        <Link
          href="/formularios"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white hover:bg-white/20 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6 space-y-4">
        <TextInput
          label="Título"
          value={titulo}
          onChange={handleTituloChange}
          placeholder="Nombre del formulario"
        />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={2}
            placeholder="Descripción opcional"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--ddna-blue)] focus:border-transparent"
          />
        </div>
        <TextInput
          label="Slug"
          value={slug}
          onChange={(v) => {
            setSlug(v);
            setSlugTouched(true);
          }}
          placeholder="url-publica"
        />
      </div>

      <div className="flex items-center justify-between gap-3 mb-4">
        <FieldTypePicker
          disabled={def.fields.length >= MAX_FIELDS}
          onSelect={(type: TipoCampo) => setDef((d) => addField(d, type))}
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className={clsx(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              preview
                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            )}
          >
            {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {preview ? 'Editar' : 'Vista previa'}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#1a2556] hover:bg-[#2a3570] transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-4">
        {def.fields.length} {def.fields.length === 1 ? 'campo' : 'campos'} de {MAX_FIELDS} máximo
      </p>

      {preview ? (
        <BuilderPreview definicion={def} titulo={titulo} descripcion={descripcion} />
      ) : def.fields.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          Todavía no hay campos. Agregá el primero con el botón «Agregar campo».
        </div>
      ) : (
        <div className="space-y-4">
          {def.fields.map((field, index) => (
            <FieldEditor
              key={field.id}
              field={field}
              index={index}
              total={def.fields.length}
              logic={def.logic}
              allFields={def.fields}
              onUpdate={(patch: Partial<CampoFormulario>) =>
                setDef((d) => updateField(d, field.id, patch))
              }
              onMove={(dir) => setDef((d) => moveField(d, field.id, dir))}
              onRemove={() => setDef((d) => removeField(d, field.id))}
              onLogicChange={handleLogicChange}
            />
          ))}
        </div>
      )}

      {toast && <Toast toast={toast} />}
    </div>
  );
}
