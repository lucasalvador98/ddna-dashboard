# DDNA Dashboard — Estado del Proyecto

> **Última actualización**: Abril 2026
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

### 3. Base de datos Supabase
- **3 tablas**: `fuentes_datos`, `indicadores`, `datos_indicadores`, `uploads`
- **8 fuentes de datos** seedeadas (DEIS, INDEC, Aprender, Censo, Ministerio Público, etc.)
- **11 indicadores** seedeados (mortalidad infantil, pobreza, escolarización, denuncias, cobertura vacunal, abandono escolar, indigencia, presupuesto, aprender, inversión, población)
- **~66 datos históricos** (2018-2024) con series temporales por indicador y región
- RLS: select público, insert/update solo admin
- Columna `desglose` JSONB en `datos_indicadores` para series con subdimensiones (vacuna, nivel educativo, tipo de denuncia, etc.)

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

### 9. ETL Python
- `etl/` — Pipeline completo para cargar datos desde Excel
- Fases: `inspect` → `transform` → `load`
- Transformadores por categoría: salud, educación, pobreza, seguridad, demografía
- SQL generator con UPSERT y UUIDs deterministas
- CLI: `python main.py etl --all`

### 10. Deploy en Vercel
- **Live: https://ddna-dashboard.vercel.app/**
- Conectado a repo GitHub
- Build automático en push a main

---

## Pending 🔲

### Roadmap propuesto (abril 2026)
- **ETL real de Excel/CSV** (alta prioridad): Mejorar los scripts en `etl/` para soportar todas las estructuras de los archivos bajo `datos/raw/` y cargar datos reales a Supabase.
- **Automatización**: Añadir GitHub Action que ejecute `python etl/main.py etl --all` diariamente.
- **Upload CSV**: Mejorar la interfaz de carga con mapeo dinámico de columnas y validación previa.
- **Dashboard UI**: Migrar componentes de Recharts a versiones más modernas o a Plotly cuando se requieran visualizaciones avanzadas (mapas, diagramas).
- **Testing**: Añadir pruebas unitarias (Jest) para los hooks y componentes críticos.
- **Documentación**: Generar docs Markdown en `docs/` (incluyendo la propuesta) y actualizar README.
- **Deploy**: Configurar variables de entorno en Vercel y habilitar preview deploys por PR.



- **Carga de más datos desde Excel**: Los otros archivos (educación, pobreza, seguridad) tienen estructuras complejas — necesitan ajustes en transformadores
- **Auth**: No requerido — datos públicos

---

## Datos en Supabase (al 14/04/2026)

| Categoría | Registros | Notas |
|-----------|----------|-------|
| Salud | 27 | Mortalidad infantil (2005-2024), Cobertura vacunal |
| Pobreza | 20 | |
| Educación | 23 | |
| Seguridad | 10 | |
| Inversión | 12 | |
| Demografía | 5 | |
| **Total** | **97** | |

### Método de carga
- ETL: `python etl/main.py transform --all` → genera JSONs en `etl/output/`
- Luego: `python etl/main.py load --method sql` → genera SQL
- SQL ejecutado en Supabase SQL Editor

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

#### ETL de datos reales desde Excel/CSV — PENDIENTE
**Problema**: Los archivos en `datos/raw/` contienen datos reales pero están en formato Excel/CSV heterogéneo. Solo hay ~66 datos seedeados en Supabase (la mayoría mock approximations).

**Archivos disponibles**:
```
datos/raw/
  deis/
    Edad_Madre 2022.xlsx
    datosDeis-2024-07-26 (3).xlsx
    Mortalidad infantil Nacion-Provincia.xlsx
  censo-2022/
    Cobertura_Salud-Censo.xlsx
    Educacion por nivel.xlsx
    Educacion por edades.xlsx
    censo poblacion.xlsx
  aprender/
    Estadisticas-educativas-Anuario-2023.pdf
    Educacion Provincia.xlsx
  pobreza/
    Encoprac 16 a 24 años.xlsx
    cuadros_informe_pobreza_09_24 (1).xls
    cuadros_encoprac_2022.xlsx
  justicia/
    Justicia_cba_2022.xlsx
    INFORME SEGUNDO TRIMESTRE 2024 oficina de violencia domestica!!.pdf
  consumo/
    consumo_2022.pdf
```

**Solución**: Scripts Python ETL que:
1. Lean cada archivo con `pandas`
2. Normalicen columnas (año, valor, región, desglose)
3. Inserten en `datos_indicadores` via Supabase REST API
4. Se ejecuten manualmente al inicio, luego via GitHub Actions

**Nota**: El archivo `salud adolescente deis.csv` tiene problemas de encoding (caracteres acentuados).

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

## Supabase — Detalle de datos existentes

### Indicadores (tabla `indicadores`)

| ID (parcial) | Categoría | Nombre | Unidad | Fuente |
|---|---|---|---|---|
| `a99d98e8...` | salud | Mortalidad infantil | ‰ | DEIS |
| `aca8b608...` | salud | Cobertura vacunal | % | DEIS |
| `10e42827...` | educacion | Tasa neta de escolarización | % | Aprender |
| `003b7041...` | educacion | Abandono escolar | % | Aprender |
| `03ab793b...` | pobreza | Pobreza infantil | % | INDEC |
| `686c2ed9...` | pobreza | Indigencia infantil | % | INDEC |
| `87e893b1...` | seguridad | Denuncias registradas | casos | Ministerio Público |
| `d8db8901...` | inversion | Inversión social en infancia | Md | Dir. Gral. Estadística |
| `5ca34a61...` | inversion | % presupuesto para infancia | % | Dir. Gral. Estadística |
| `9ba0f4d7...` | educacion | Resultados evaluaciones Aprender | % | Aprender |
| `ed0cb02a...` | demografia | Población adolescente | hab | Censo 2022 |

### Datos por indicador (tabla `datos_indicadores`)

| Indicador | Región | Período | Cantidad |
|---|---|---|---|
| Mortalidad infantil | Córdoba + Argentina | 2018-2024 | 14 |
| Cobertura vacunal | Córdoba (por vacuna en desglose) | 2023 | 6 |
| Escolarización | Córdoba | 2018-2023 | 6 |
| Abandono escolar | Córdoba | 2019-2023 | 5 |
| Pobreza infantil | Córdoba + Argentina | 2018-2024 | 13 |
| Indigencia infantil | Córdoba | 2018-2023 | 6 |
| Denuncias registradas | Córdoba | 2019-2023 | 5 |
| Inversión social | Córdoba | 2019-2023 | 5 |
| % Presupuesto infancia | Córdoba | 2018-2024 | 7 |
| Resultados Aprender | Córdoba (por área en desglose) | 2023 | 4 |
| Población adolescente | Córdoba | 2019-2023 | 5 |

### Columna `desglose` (JSONB)

Se usa para series con subdimensiones:
```json
// Cobertura vacunal por tipo
{"vacuna": "BCG"}

// Resultados Aprender por área
{"area": "Lengua", "nivel": "satisfactorio"}

// Escolarización por nivel (tbd)
{"nivel": "inicial"}
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
Crear `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ppyyqrvirjqmfpqaqnxy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweXlxcnZpcmpxbWZwcWFxbnh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxOTAzMDUsImV4cCI6MjA5MTc2NjMwNX0.eA5yt50LMPf_MlxZGRd9Wq0IiV4Kokd6wI3WaMZK3z8
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