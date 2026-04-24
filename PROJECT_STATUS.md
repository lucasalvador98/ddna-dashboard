# DDNA Dashboard — Estado del Proyecto

> **Última actualización**: Abril 2026 (rediseño visual)
> **Live**: https://ddna-dashboard.vercel.app/
> **Repo**: https://github.com/lucasalvador98/ddna-dashboard
> **Supabase**: `ddna-dashboard` (ppyyqrvirjqmfpqaqnxy)

---

## Qué está hecho ✅

### 1. Scaffold del proyecto
- Next.js 16 + TypeScript + Tailwind v4 + App Router
- Dependencias: `recharts`, `plotly.js`, `react-plotly.js`, `@supabase/supabase-js`, `lucide-react`, `clsx`
- Compila limpio, todas las rutas funcionando

### 2. Identidad visual DDNA
- Paleta de colores en `globals.css` como CSS custom properties (tomada de `public/themes/Tema.json`)
- Fuente Epilogue vía `next/font/google`
- Logos oficiales: `public/logos/LOGO DDNA_HORIZONTAL_COLOR.png`, `public/logos/Cba.png`
- Sidebar colapsable con logo DDNA + escudo de Córdoba
- Header con branding institucional
- Homepage rediseñado: hero con gradiente naranja→ámbar, wave divider, círculos decorativos flotantes
- Quick Access con botones circulares coloridos y rotación alternada
- Stats section con fondo navy oscuro como ancla visual

### 3. Base de datos Supabase
- **Tabla simplificada**: `indicadores` con valores embebidos (1667 registros al 15/04/2026)
- RLS: select público para lectura
- Columna `desglose` JSONB para subdimensiones (vacuna, nivel educativo, tipo de denuncia, etc.)

### 4. Home page conectada a Supabase
- `useIndicadores()` hook en `src/lib/hooks.ts`: consulta Supabase, calcula cambios interanuales, fallback automático a placeholders
- Indicador visual: "Datos en tiempo real" (verde) vs "Datos de referencia" (ámbar)
- KPI cards con cambio respecto al período anterior

### 5. 6 secciones con gráficos Recharts
- `/salud` — LineChart mortalidad + BarChart cobertura vacunal
- `/educacion` — AreaChart escolarización + BarChart Aprender
- `/pobreza` — LineChart pobreza/indigencia + BarChart brecha etaria
- `/seguridad` — LineChart denuncias + PieChart distribución por tipo
- `/inversion` — ComposedChart barras apiladas + LineChart % presupuesto
- `/fuentes` — Tabla de fuentes con badges por categoría + fallback data

### 6. API routes
- `/api/health` — Health check (verifica Supabase)
- `/api/indicadores` — GET indicadores con filtro por categoría
- `/api/fuentes` — GET fuentes de datos
- `/api/upload` — POST carga de datos CSV (admin)

### 7. Admin upload interface
- `/admin` — Interfaz web para cargar datos CSV por indicador
- Preview de datos antes de insertar
- Historial de upl oads en tabla `uploads`

### 8. Identidad DDNA completa
- Fuentes: Caprasimo (headings), DK Lemon Yellow Sun (labels), Epilogue (body)
- Iconos Recurso 1-7 PNG en sidebar (reemplazan Lucide)
- 20 dataColors de Tema.json como CSS variables para gráficos
- Tipografía consistente: .font-display (Caprasimo), .font-accent (DK Lemon), .font-body (Epilogue)

### 9. ETL Python (documentado en etl/README.md)
- `etl/` — Pipeline completo para cargar datos desde Excel
- Fases: `inspect` → `transform` → `load`
- Transformadores por categoría: salud, educación, pobreza, seguridad, demografía
- SQL generator con UPSERT y UUIDs deterministas
- CLI: `python main.py etl --all`
- Scripts especializados: `load_paicor.py`, `load_inversion.py`
- Catálogo de fuentes: `sources.yaml`
- Inspector interactivo: `etl_inspect.py`

### 10. Deploy en Vercel
- **Live: https://ddna-dashboard.vercel.app/**
- Conectado a repo GitHub
- Build automático en push a main

---

## Pending 🔲

### Roadmap propuesto (abril 2026)
- **ETL real de Excel/CSV** — ✅ HECHO (15/04/2026): Todos los transformadores completados y datos cargados a Supabase (1667 registros).
- **Automatización**: Añadir GitHub Action que ejecute `python etl/main.py etl --all` diariamente.
- **Upload CSV**: Mejorar la interfaz de carga con mapeo dinámico de columnas y validación previa.
- **Dashboard UI**: Migrar componentes de Recharts a versiones más modernas o a Plotly cuando se requieran visualizaciones avanzadas (mapas, diagramas).
- **Testing**: Añadir pruebas unitarias (Jest) para los hooks y componentes críticos.
- **Documentación**: Generar docs Markdown en `docs/` (incluyendo la propuesta) y actualizar README.
- **Deploy**: Configurar variables de entorno en Vercel y habilitar preview deploys por PR.
- **Auth**: No requerido — datos públicos

---

## Datos en Supabase (al 15/04/2026)

| Categoría | Registros | Notas |
|----------|----------|-------|
| Salud | 145 | Mortalidad infantil + DEIS |
| Educación | 1056 | Aprender + Censo 2022 |
| Pobreza | 48 | INDEC + ENCOPRAC |
| Seguridad | 7 | Ministerio Público Córdoba |
| Demografía | 411 | Censo 2022 + DEIS |
| **Total** | **1667** | |

### Método de carga
- ETL: `python etl/main.py transform --category <cat>` → genera JSONs en `etl/output/`
- Carga via Supabase REST API con service_role key
- Fix pobreza: columnas con formato "2do. semestre 2016" parseadas correctamente
- Fix seguridad: datos de nivel fila agregados por materia

---

## Links útiles

- **Dashboard live**: https://ddna-dashboard.vercel.app/
- **Repo**: https://github.com/lucasalvador98/ddna-dashboard
- **Supabase**: https://supabase.com/dashboard/project/ppyyqrvirjqmfpqaqnxy
- **Supabase SQL Editor**: https://supabase.com/dashboard/project/ppyyqrvirjqmfpqaqnxy/sql
**Implementado en commit `727b27a`**:
- `src/lib/chart-data.ts` — Datos placeholder centralizados para las 5 secciones
- `src/lib/use-chart-data.ts` — Hook `useChartData(categoria)` que:
  1. Consulta `indicadores` + `datos_indicadores` desde Supabase por categoría
  2. Transforma datos según el tipo (serie temporal, comparativa, desglose, categórico)
  3. Usa columna `desglose` JSONB para subdimensiones (vacunas, áreas Aprender, etc.)
  4. Fallback automático a `placeholderChartData[categoria]` si Supabase no responde
- 5 secciones actualizadas: `salud`, `educacion`, `pobreza`, `seguridad`, `inversion`
- `fuentes` ya usaba Supabase directamente (no necesita hook)

**NOTA**: Los datos en Supabase son limitados (~66 puntos, la mayoría mock approximations).
Los gráficos muestran datos de Supabase cuando hay, y fallback a placeholder cuando no.
Para que todos los gráficos muestren datos reales de Supabase, hay que cargar más datos
via ETL desde los archivos Excel/CSV en `datos/raw/`.

### Prioridad MEDIA (en progreso)

#### Datos de referencia en Supabase — ✅ HECHO (parcial)
Se sembraron ~110 data points en Supabase para los 11 indicadores. Los datos son **referencia/aproximación** que coinciden con los placeholders — no son extraídos de los Excel reales. Todos los gráficos funcionan con datos de Supabase cuando está conectado.

**Indicadores con datos completos**: mortalidad (14), cobert. vacunal (11), escolarización (6), abandono (5), aprender (12), pobreza (13), indigencia (7), denuncias (10), inversión (5), presupuesto (7), población (5).

#### ETL de datos reales desde Excel/CSV — ✅ HECHO (15/04/2026)
**Solución implementada**:
- Transformadores parcheados para manejar estructuras complejas:
  - **pobreza**: columnas con formato "2do. semestre 2016" parseadas con regex
  - **seguridad**: datos de nivel fila agregados por materia (Violencia Familiar, Familia, Penal Juvenil, etc.)
- 1667 registros cargados a Supabase via REST API

**Archivos procesados**:
```
datos/raw/
  deis/
    Mortalidad infantil Nacion-Provincia.xlsx → 144 registros (salud)
    Edad_Madre 2022.xlsx → demografia
    datosDeis-2024-07-26 (3).xlsx → demografia
  censo-2022/
    Educacion por nivel.xlsx → 1056 registros (educacion)
    Educacion por edades.xlsx → educacion
    censo poblacion.xlsx → 411 registros (demografia)
    Cobertura_Salud-Censo.xlsx → salud
  aprender/
    Educacion Provincia.xlsx → educacion
  pobreza/
    cuadros_informe_pobreza_09_24 (1).xls → 48 registros (pobreza)
    Encoprac 16 a 24 años.xlsx → pobreza
    cuadros_encoprac_2022.xlsx → pobreza
  justicia/
    Justicia_cba_2022.xlsx → 7 registros (seguridad)
```

### Prioridad BAJA

#### Auth con Supabase
- Login para admins que suben datos
- RLS ya configurado con `auth.jwt() ->> 'role' = 'admin'`
- Falta implementar la UI de login y el flujo de autenticación

#### Interfaz de upload CSV
- Página `/admin` protegida con auth
- Formulario para subir CSV con validación
- Mapeo de columnas del CSV a campos de `datos_indicadores`
- Registro en tabla `uploads` para auditoría

#### Deploy en Vercel
- Conectar repo GitHub → Vercel
- Configurar env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Build automático en push a `main`

---

## Supabase — Schema actual (15/04/2026)

### Tabla `indicadores` (schema simplificado)

```sql
CREATE TABLE indicadores (
  id UUID PRIMARY KEY,
  indicador_nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  unidad TEXT DEFAULT 'casos',
  periodo TEXT NOT NULL,
  region TEXT DEFAULT 'Córdoba',
  desglose JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Datos cargados (1667 registros)

| Categoría | Registros | Fuente |
|----------|-----------|--------|
| educacion | 1056 | Aprender + Censo 2022 |
| demografia | 411 | Censo 2022 + DEIS |
| salud | 145 | Mortalidad infantil + DEIS |
| pobreza | 48 | INDEC + ENCOPRAC |
| seguridad | 7 | Ministerio Público Córdoba |

### Columna `desglose` (JSONB)

Se usa para subdimensiones:
```json
// Mortalidad por provincia
{"provincia": "Córdoba"}

// Escolarización por nivel
{"nivel": "Primario", "sector": "estatal"}

// Población por edad y sexo
{"edad": "0", "sexo": "total"}
```

---

## Configuración del entorno de desarrollo

### Requisitos
- Node.js 18+
- npm o pnpm
- Cuenta de Supabase (proyecto ya creado)

### Setup
```bash
git clone https://github.com/lucasalvador98/ddna-dashboard.git
cd ddna-dashboard
npm install
```

### Variables de entorno
El proyecto ya tiene `.env.local` configurado con:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ppyyqrvirjqmfpqaqnxy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweXlxcnZpcmpxbWZwcWFxbnh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE5MDMwNSwiZXhwIjoyMDkxNzY2MzA1fQ.g3NSsIO2Y6qGTtfvBQciTfTWyQIW0ev2tuUjY5QcYLM
```

### Ejecutar
```bash
npm run dev
# Abre http://localhost:3000
```

### Verificar conexión Supabase
```bash
# Health check
curl http://localhost:3000/api/health

# Indicadores
curl http://localhost:3000/api/indicadores?categoria=salud

# Fuentes
curl http://localhost:3000/api/fuentes
```

---

## Decisiones técnicas registradas

| Decisión | Elección | Razón |
|----------|----------|-------|
| Framework | Next.js 16 (App Router) | SSR/SSG, API routes, deploy Vercel |
| Visualización | Recharts (primario) + Plotly.js (mapas) | Recharts para KPIs simples, Plotly para complejos |
| Base de datos | Supabase (PostgreSQL) | Auth, storage, API REST autogenerada, sin backend propio |
| Datos placeholder | Fallback automático en hooks | Dashboard funciona sin Supabase conectado |
| Desglose de datos | JSONB en `datos_indicadores` | Flexibilidad para subdimensiones sin alterar esquema |
| Identidad visual | Paleta DDNA + Epilogue font + logos oficiales | Identidad institucional coherente con la propuesta |
| RLS | Público lectura, admin escritura | Seguridad por defecto, sin auth UI todavía |

---

## Para continuar con otro agente

1. **Clonar el repo**: `git clone https://github.com/lucasalvador98/ddna-dashboard.git`
2. **Instalar**: `npm install`
3. **Crear `.env.local`** con las credenciales de Supabase (ver sección arriba)
4. **Leer este archivo** (`PROJECT_STATUS.md`) completo
5. **Prioridad inmediata**: Implementar `useChartData()` y conectar las 6 secciones a Supabase
6. **Luego**: Scripts ETL Python para cargar datos reales desde `datos/raw/`

---

## 工作会话 — Abril 2026 (etl-improvements)

### Completado ✅

#### 1. APIs Externas conectadas
- **`/api/external`** — Endpoint unificado para explorar APIs públicas:
  - `datos.gob.ar` — Catálogo CKAN nacional (educación, salud, NNyA, trabajo)
  - `datosgestionabierta.cba.gov.ar` — Catálogo CKAN provincial Córdoba
  - `senaf` — CSVs directos de programas de infancia (2 datasets)
  - `indec` — Información sobre FTP, Shiny, microdatos
  - `contextual` — Indicadores no-NNyA (IPC, empleo juvenil, NBI)

#### 2. Repositorio DDNA
- **Bucket Storage**: `ddna-repositorio` en Supabase
- **Tabla**: `repositorio` con metadata de archivos (16 archivos)
- **Página**: `/repositorio` — Explorar y subir archivos propios
- **Upload**: `/api/repositorio/upload` — Para subir archivos desde el dashboard

#### 3. Páginas nuevas
- `/apis` — Explorador de APIs externas conectadas
- `/repositorio` — Repositorio de archivos propios de la Defensoría

#### 4. Fixes de frontend
- `educacion`: Bar chart por edad (no time series) — la DB no tiene serie temporal de escolarización
- `inversion`: Bar chart por organismo (no time series) — todo 2024, sin evolución
- `pobreza`: Filtro por tipo "Personas" (evita duplicados)
- `salud`: Exact match en indicadores (evita data collision de 8 series mezcladas)
- Sidebar: Fix advertencia Image (`style={{ height: "auto" }}`)
- Quick Access: Removida (no funcionaba bien)
- Build: Todos los warnings resueltos

#### 5. Documentación actualizada
- `docs/FUENTES.md` — Catálogo completo de APIs y fuentes de datos

---

### Pendiente / Próxima sesión 🔲

1. **Subir archivos faltantes al repositorio**:
   - `Encuesta adultos y NyN 12 a 18 Años 2024 (Responses).xlsx`
   - `Encuesta adultos y NyN 12 a 18 Años 2024 Sec oscar (Responses).xlsx`
   - `Datos Proteccion Digital.docx`

2. **ETL para nuevos datos**:
   - Extraer datos de los PDFs del repositorio
   - Integrar al dashboard (cargar a Supabase vía API)

3. **Agente externo para bibliografía**:
   - Conectar con repositorio
   - Query a PDFs mediante IA

4. **Mejoras visuales**:
   - Tooltips en gráficos
   - Animaciones suaves
   - Responsive en móvil

---

### Acceso

| Recurso | URL |
|---------|-----|
| Dashboard | https://ddna-dashboard.vercel.app/ |
| Supabase | https://supabase.com/dashboard/project/ppyyqrvirjqmfpqaqnxy |
| APIs externas | `/apis` (en local) |
| Repositorio | `/repositorio` (en local) |

### Credenciales (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```