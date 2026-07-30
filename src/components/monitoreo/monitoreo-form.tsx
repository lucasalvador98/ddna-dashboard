'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle,
  Loader2,
  AlertCircle,
  UserPlus,
  FileText,
  Newspaper,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '@/lib/supabase';
import {
  MEDIO_OPTIONS,
  GENERO_PERIODISTICO_OPTIONS,
  SECCION_OPTIONS,
  TOPICO_PRINCIPAL_OPTIONS,
  FUENTE_CITADA_OPTIONS,
  USO_FUENTES_OPTIONS,
  PROVINCIA_OPTIONS,
  LOCALIDAD_CORDOBA_OPTIONS,
  EMPTY_FORM_DATA,
  EMPTY_ACTOR,
  type RegistroFormData,
  type ActorFormData,
  type MonitoreoActor,
} from './constants';
import { SelectField } from './select-field';
import { TextInput } from './text-input';
import { Toggle } from './toggle';
import { ActorForm } from './actor-form';

interface FormViewProps {
  editingId: number | null;
  onSave: () => void;
  onCancel: () => void;
}

// ── Collapsible section ──────────────────────────────────────────

function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full mb-4"
      >
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          {icon}
          {title}
        </h3>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {open && <div>{children}</div>}
    </section>
  );
}

// ── Toast notification ──────────────────────────────────────────

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={clsx(
        'fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-in',
        type === 'success'
          ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          : 'bg-red-50 border border-red-200 text-red-700'
      )}
    >
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
      )}
      {message}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// FORM VIEW
// ═══════════════════════════════════════════════════════════════════

const REQUIRED_FIELDS = ['medio', 'titulo', 'fecha_noticia'] as const;

type RequiredField = (typeof REQUIRED_FIELDS)[number];

function getFieldError(
  field: RequiredField,
  formData: RegistroFormData,
  touched: Set<string>
): string | undefined {
  if (!touched.has(field)) return undefined;
  if (!formData[field]) {
    const labels: Record<RequiredField, string> = {
      medio: 'El medio es obligatorio',
      titulo: 'El título es obligatorio',
      fecha_noticia: 'La fecha de la noticia es obligatoria',
    };
    return labels[field];
  }
  return undefined;
}

export function MonitoreoForm({ editingId, onSave, onCancel }: FormViewProps) {
  const [formData, setFormData] = useState<RegistroFormData>(EMPTY_FORM_DATA);
  const [actors, setActors] = useState<ActorFormData[]>([{ ...EMPTY_ACTOR }]);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(!!editingId);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Track if form was submitted (to show all errors)
  const [submitted, setSubmitted] = useState(false);

  // Load existing registro if editing
  useEffect(() => {
    if (!editingId) return;
    let cancelled = false;

    async function load() {
      try {
        const { data: registro, error: regError } = await supabase
          .from('monitoreo_registros')
          .select('*')
          .eq('id', editingId)
          .single();

        if (regError) throw regError;
        if (!registro || cancelled) return;

        const { data: actorData } = await supabase
          .from('monitoreo_actores')
          .select('*')
          .eq('registro_id', editingId)
          .order('orden', { ascending: true });

        if (cancelled) return;

        setFormData({
          quien_carga: registro.quien_carga ?? '',
          fecha_noticia: registro.fecha_noticia ?? '',
          medio: registro.medio,
          titulo: registro.titulo,
          genero_periodistico: registro.genero_periodistico ?? '',
          seccion: registro.seccion ?? '',
          topico_principal: registro.topico_principal ?? '',
          caso: registro.caso ?? false,
          provincia: registro.provincia ?? '',
          ciudad_cordoba: registro.ciudad_cordoba ?? '',
          uso_estadisticas: registro.uso_estadisticas ?? false,
          fuente_citada_1: registro.fuente_citada_1 ?? '',
          fuente_citada_2: registro.fuente_citada_2 ?? '',
          uso_fuentes: registro.uso_fuentes ?? '',
        });

        if (actorData && actorData.length > 0) {
          setActors(
            actorData.map((a: MonitoreoActor) => ({
              actor_descripcion: a.actor_descripcion ?? '',
              genero: a.genero ?? '',
              franja_etaria: a.franja_etaria ?? '',
              victimario_victima: a.victimario_victima ?? '',
              rol: a.rol ?? '',
              identificabilidad: a.identificabilidad ?? false,
            }))
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar registro');
        }
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [editingId]);

  const updateFormField = <K extends keyof RegistroFormData>(
    key: K,
    value: RegistroFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const markTouched = (field: string) => {
    setTouched(prev => new Set(prev).add(field));
  };

  const updateActor = (index: number, field: keyof ActorFormData, value: string | boolean) => {
    setActors(prev => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
  };

  const addActor = () => {
    if (actors.length >= 3) return;
    setActors(prev => [...prev, { ...EMPTY_ACTOR }]);
  };

  const removeActor = (index: number) => {
    const actor = actors[index];
    const hasData =
      actor.actor_descripcion ||
      actor.genero ||
      actor.franja_etaria ||
      actor.victimario_victima ||
      actor.rol ||
      actor.identificabilidad;
    if (hasData && !confirm('Este actor tiene datos cargados. ¿Seguro que lo querés eliminar?')) {
      return;
    }
    setActors(prev => prev.filter((_, i) => i !== index));
  };

  // Derive validity
  const isFormValid =
    formData.medio.trim() !== '' &&
    formData.titulo.trim() !== '' &&
    formData.fecha_noticia.trim() !== '';

  // Show errors for all required fields after first submit
  const showAllErrors = submitted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (!isFormValid) {
      // Mark all required fields as touched
      setTouched(prev => {
        const next = new Set(prev);
        for (const f of REQUIRED_FIELDS) next.add(f);
        return next;
      });
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const registroPayload = {
        quien_carga: formData.quien_carga || null,
        fecha_noticia: formData.fecha_noticia || null,
        medio: formData.medio,
        titulo: formData.titulo,
        genero_periodistico: formData.genero_periodistico || null,
        seccion: formData.seccion || null,
        topico_principal: formData.topico_principal || null,
        caso: formData.caso || false,
        provincia: formData.provincia || null,
        ciudad_cordoba: formData.ciudad_cordoba || null,
        uso_estadisticas: formData.uso_estadisticas || false,
        fuente_citada_1: formData.fuente_citada_1 || null,
        fuente_citada_2: formData.fuente_citada_2 || null,
        uso_fuentes: formData.uso_fuentes || null,
      };

      if (editingId) {
        // UPDATE existing
        const { error: updateError } = await supabase
          .from('monitoreo_registros')
          .update(registroPayload)
          .eq('id', editingId);

        if (updateError) throw updateError;

        // Replace actors
        await supabase.from('monitoreo_actores').delete().eq('registro_id', editingId);

        const validActors = actors
          .map((a, i) => ({
            registro_id: editingId,
            orden: i + 1,
            actor_descripcion: a.actor_descripcion || null,
            genero: a.genero || null,
            franja_etaria: a.franja_etaria || null,
            victimario_victima: a.victimario_victima || null,
            rol: a.rol || null,
            identificabilidad: a.identificabilidad || false,
          }))
          .filter(a => a.actor_descripcion);

        if (validActors.length > 0) {
          const { error: actError } = await supabase.from('monitoreo_actores').insert(validActors);
          if (actError) throw actError;
        }
      } else {
        // INSERT new
        const { data: newRegistro, error: insertError } = await supabase
          .from('monitoreo_registros')
          .insert(registroPayload)
          .select('id')
          .single();

        if (insertError) throw insertError;
        if (!newRegistro) throw new Error('No se pudo crear el registro');

        const validActors = actors
          .map((a, i) => ({
            registro_id: newRegistro.id,
            orden: i + 1,
            actor_descripcion: a.actor_descripcion || null,
            genero: a.genero || null,
            franja_etaria: a.franja_etaria || null,
            victimario_victima: a.victimario_victima || null,
            rol: a.rol || null,
            identificabilidad: a.identificabilidad || false,
          }))
          .filter(a => a.actor_descripcion);

        if (validActors.length > 0) {
          const { error: actError } = await supabase.from('monitoreo_actores').insert(validActors);
          if (actError) throw actError;
        }
      }

      setToast({
        message: editingId ? 'Registro actualizado correctamente' : 'Registro creado correctamente',
        type: 'success',
      });

      // Brief delay so user sees the toast before redirect
      setTimeout(() => onSave(), 600);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      setError(msg);
      setToast({ message: msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const medioError =
    showAllErrors || touched.has('medio')
      ? getFieldError('medio', formData, new Set(['medio']))
      : undefined;
  const tituloError =
    showAllErrors || touched.has('titulo')
      ? getFieldError('titulo', formData, new Set(['titulo']))
      : undefined;
  const fechaError =
    showAllErrors || touched.has('fecha_noticia')
      ? getFieldError('fecha_noticia', formData, new Set(['fecha_noticia']))
      : undefined;

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[var(--ddna-blue)] animate-spin" />
        <span className="ml-3 text-slate-500">Cargando registro...</span>
      </div>
    );
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {editingId ? 'Editar registro' : 'Nuevo registro'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || (submitted && !isFormValid)}
              className="flex items-center gap-2 px-5 py-2 bg-[var(--ddna-blue)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {editingId ? 'Actualizar' : 'Guardar'}
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── 1. Datos generales (always open) ───────────────────── */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--ddna-blue)]" />
            Datos generales
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <TextInput
              label="Fecha de la noticia"
              type="date"
              value={formData.fecha_noticia}
              onChange={v => updateFormField('fecha_noticia', v)}
              onBlur={() => markTouched('fecha_noticia')}
              required
              error={fechaError}
            />
            <SelectField
              label="Medio"
              value={formData.medio}
              options={MEDIO_OPTIONS}
              onChange={v => updateFormField('medio', v)}
              onBlur={() => markTouched('medio')}
              required
              error={medioError}
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Título <span className="text-red-500 ml-0.5">*</span>
            </label>
            <textarea
              value={formData.titulo}
              onChange={e => updateFormField('titulo', e.target.value)}
              onBlur={() => markTouched('titulo')}
              placeholder="Título de la noticia"
              required
              rows={2}
              className={clsx(
                'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[var(--ddna-blue)] focus:border-transparent resize-none',
                tituloError ? 'border-red-400' : 'border-slate-300'
              )}
            />
            {tituloError && <p className="text-xs text-red-500 mt-1">{tituloError}</p>}
          </div>
          <div className="mt-4">
            <TextInput
              label="Quién carga"
              value={formData.quien_carga}
              onChange={v => updateFormField('quien_carga', v)}
              placeholder="Nombre de la persona"
            />
          </div>
        </section>

        {/* ── 2. Clasificación (collapsible) ─────────────────────── */}
        <CollapsibleSection
          title="Clasificación"
          icon={<Newspaper className="w-4 h-4 text-[var(--ddna-blue)]" />}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <SelectField
                label="Género periodístico"
                value={formData.genero_periodistico}
                options={GENERO_PERIODISTICO_OPTIONS}
                onChange={v => updateFormField('genero_periodistico', v)}
              />
              <SelectField
                label="Sección"
                value={formData.seccion}
                options={SECCION_OPTIONS}
                onChange={v => updateFormField('seccion', v)}
              />
              <SelectField
                label="Tópico principal"
                value={formData.topico_principal}
                options={TOPICO_PRINCIPAL_OPTIONS}
                onChange={v => updateFormField('topico_principal', v)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="Provincia"
                value={formData.provincia}
                options={PROVINCIA_OPTIONS}
                onChange={v => updateFormField('provincia', v)}
                placeholder="Córdoba"
              />
              <SelectField
                label="Ciudad de Córdoba"
                value={formData.ciudad_cordoba}
                options={LOCALIDAD_CORDOBA_OPTIONS}
                onChange={v => updateFormField('ciudad_cordoba', v)}
                placeholder="Buscar localidad..."
              />
            </div>
            <SelectField
              label="¿Es un caso?"
              value={formData.caso ? 'Sí' : 'No'}
              options={['Sí', 'No'] as const}
              onChange={v => updateFormField('caso', v === 'Sí')}
            />
          </div>
        </CollapsibleSection>

        {/* ── 3. Fuentes (collapsible) ───────────────────────────── */}
        <CollapsibleSection
          title="Fuentes"
          icon={<BookOpen className="w-4 h-4 text-[var(--ddna-blue)]" />}
        >
          <div className="space-y-4">
            <Toggle
              label="¿Usa estadísticas?"
              value={formData.uso_estadisticas}
              onChange={v => updateFormField('uso_estadisticas', v)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <SelectField
                label="Fuente citada 1"
                value={formData.fuente_citada_1}
                options={FUENTE_CITADA_OPTIONS}
                onChange={v => updateFormField('fuente_citada_1', v)}
                placeholder="Seleccionar fuente"
              />
              <SelectField
                label="Fuente citada 2"
                value={formData.fuente_citada_2}
                options={FUENTE_CITADA_OPTIONS}
                onChange={v => updateFormField('fuente_citada_2', v)}
                placeholder="Seleccionar fuente"
              />
              <SelectField
                label="Uso de fuentes"
                value={formData.uso_fuentes}
                options={USO_FUENTES_OPTIONS}
                onChange={v => updateFormField('uso_fuentes', v)}
                placeholder="Cantidad de fuentes"
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* ── 4. Actores (collapsible) ───────────────────────────── */}
        <CollapsibleSection
          title="Actores"
          icon={<UserPlus className="w-4 h-4 text-[var(--ddna-blue)]" />}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {actors.length === 0
                  ? 'No hay actores cargados'
                  : `${actors.length} actor${actors.length !== 1 ? 'es' : ''} cargado${actors.length !== 1 ? 's' : ''}`}
              </p>
              {actors.length < 3 && (
                <button
                  type="button"
                  onClick={addActor}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--ddna-blue)] border border-[var(--ddna-blue)]/30 rounded-lg hover:bg-[var(--ddna-blue)]/5 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Agregar actor
                </button>
              )}
            </div>

            <div className="space-y-4">
              {actors.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">
                  No hay actores. Hacé clic en &ldquo;Agregar actor&rdquo; para añadir uno.
                </p>
              )}
              {actors.map((actor, index) => (
                <ActorForm
                  key={index}
                  actor={actor}
                  index={index}
                  total={actors.length}
                  onChange={updateActor}
                  onRemove={removeActor}
                />
              ))}
            </div>
          </div>
        </CollapsibleSection>

        {/* Bottom save bar */}
        <div className="flex items-center justify-end gap-3 pt-2 pb-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || (submitted && !isFormValid)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--ddna-blue)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                {editingId ? 'Actualizar registro' : 'Guardar registro'}
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
}
