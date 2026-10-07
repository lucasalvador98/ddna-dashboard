# DDNA Dashboard — Estado del Proyecto

> **Última actualización**: Octubre 2026
> **Producción**: http://179.199.132.207/observatorio/ — VPS Hostinger, self-hosted (Caddy)
> **Legacy**: https://ddna-dashboard.vercel.app/ — Vercel + Supabase Cloud; integración con GitHub desconectada el 2026-10-07, retiro pendiente
> **Repo**: https://github.com/lucasalvador98/ddna-dashboard
> **Supabase**: self-hosted en la VPS (API: http://179.199.132.207:8000). Cloud histórico `ppyyqrvirjqmfpqaqnxy` solo para el legacy y los scripts de migración (`CLOUD_*`)

---

## Qué está hecho ✅

### 1. Dashboard con datos reales
- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4
- 6 secciones con gráficos conectados a Supabase: salud, educación, pobreza, seguridad, inversión, fuentes
- KPIs con cambio respecto al período anterior
- Fallback automático a placeholders si Supabase no responde
- Bugs visuales corregidos (warnings de Image, data collision en charts, filtros duplicados)
- Identidad visual DDNA completa: paleta institucional, tipografía del portal, logos oficiales

### 2. RAG Agent — Chat con datos de indicadores
- **Endpoint**: `/api/repositorio/chat` — agente conversacional con tools
- **6 herramientas de indicadores** en `src/lib/agent/indicator-tools.ts`:
  - `listAvailableIndicators` — catálogo de indicadores por categoría
  - `getLatestIndicatorValue` — último valor de un indicador
  - `getIndicatorTimeSeries` — serie temporal completa
  - `getCategoryOverview` — resumen de categoría
  - `getIndicatorBreakdown` — desglose por dimensión (edad, género, región)
  - `search_knowledge_base` — búsqueda vectorial en documentos
- LLM: OpenAI (`gpt-4o-mini`)
- Embeddings: OpenAI `text-embedding-3-small`
- Modo herramienta + streaming de respuestas
- Citas de fuentes con badges clickeables

### 3. Repositorio Documental
- **Bucket**: `ddna-repositorio` en Supabase Storage
- **16 documentos** indexados (PDFs, DOCX, XLSX)
- **7,541 chunks** en tabla `doc_chunks` con embeddings vectoriales
- Auto-indexing al subir: el endpoint `/api/repositorio/process` extrae texto, chunkea y genera embeddings
- Búsqueda vectorial via pgvector (`search_doc_chunks`)
- Página `/repositorio` para explorar y subir archivos

### 4. Chat con Bibliografía
- **Endpoint**: `/api/repositorio/chat` — agente conversacional (mismo endpoint que el de indicadores)
- Tools: `search-docs`, `web-search`, `scrape-url`, `download-file`, `list-bucket`
- Búsqueda web via DuckDuckGo
- Scraping de URLs específicas
- Formato de respuesta: respuesta + fuentes citadas

### 5. Backfill Endpoint
- **`POST /api/admin/backfill`** — procesa todos los PDFs no procesados del repositorio
- Protegido con `INTERNAL_API_SECRET`
- Reemplaza el workflow de N8N (eliminado)
- Rate-limit safe: máximo 20 archivos por llamada, procesamiento secuencial

### 6. APIs
- `/api/health` — Health check (verifica Supabase)
- `/api/indicadores` — GET indicadores con filtro por categoría
- `/api/fuentes` — GET fuentes de datos
- `/api/upload` — POST carga de datos CSV (admin)
- `/api/external` — Proxy para APIs públicas (datos.gob.ar, gestión abierta CBA, INDEC)
- `/api/repositorio/upload` — POST subida de archivos al repositorio
- `/api/repositorio/process` — POST procesamiento de documentos (chunking + embeddings)
- `/api/repositorio/chat` — POST agente de indicadores
> El agente expone sus herramientas **dentro** de `/api/repositorio/chat`
> (function-calling): `search_knowledge_base`, `listAllDocuments`, `search_web`,
> `scrape_url`. No son endpoints HTTP separados; `web-search` y `scrape-url`
> viven como libs en `src/lib/agent/`.
- `/api/admin/backfill` — POST backfill de PDFs pendientes
- `/api/extract-pdf` — POST extracción de texto de PDF

### 7. Scripts ETL y Automatización
- `scripts/update-indec-indicators.mjs` — TMI Córdoba y Nacional vía API Series (hasta 2024 ✅)
- `scripts/load-senaf-data.mjs` — SENAF (Primeros Años, Dispositivos adolescentes, Línea 102)
- `scripts/load-salud-2024.mjs` — DEIS Estadísticas Vitales 2024 (ciclo completo)
- `scripts/load-cnv-vacunacion.mjs` — Cobertura vacunal CNV (PDFs 2024-2025)
- `scripts/load-deis-2024.mjs` — DEIS mortalidad infantil (TMNEO)
- `scripts/load-vaccination-data.mjs` — Cobertura vacunal histórica
- `scripts/load-budget-*.mjs` — Presupuesto
- `scripts/config.mjs` — Config compartida (conexión Supabase)

### 8. Deploy principal — VPS Hostinger (Docker)
- **Producción**: http://179.199.132.207/observatorio/
- Deploy vigente por el DevOps con `/home/deploy/ddna-infra/build-dashboard.py` (checkout limpio + `NEXT_PUBLIC_BASE_PATH=/observatorio`, tag `ddna-dashboard:observatorio-candidate`); Caddy `ddna-edge` enruta al servicio `dashboard:3000` del proyecto `ddna-controlled` (ver `DEPLOY_TOPOLOGY.md`)
- `deploy.sh` está **congelado y roto** (colisión de puerto 80, sin `NEXT_PUBLIC_BASE_PATH` → 404 en `/observatorio/*`, tag sin uso) — no usarlo
- La VPS corre la imagen `e3c2229b` (build `4a9a9d3`), **2 commits atrás** de `main` (`61f304c`)
- Supabase **self-hosted** en la misma VPS

### 9. Deploy legacy — Vercel (decisión de retiro pendiente)
- **Legacy**: https://ddna-dashboard.vercel.app/ — todavía alimentado por Supabase Cloud (`ppyyqrvirjqmfpqaqnxy`)
- Integración nativa de Vercel con GitHub **desconectada el 2026-10-07**: ya no hay build automático en push
- Variables de entorno configuradas: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`

---

## Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript strict |
| Estilos | Tailwind CSS v4 |
| Base de datos | Supabase self-hosted (PostgreSQL + pgvector) en la VPS |
| Embeddings | OpenAI `text-embedding-3-small` |
| LLM | OpenAI (`gpt-4o-mini`) |
| Charts | Recharts |
| Deploy | VPS Hostinger (Docker) + legacy Vercel |

---

## Supabase — Schema

### Tabla `indicadores`
- Categoría `salud` ≈ **12.800 filas** tras el ciclo DEIS 2024 (defunciones 2024, causas por capítulo CIE-10, top-10 causas, fecundidad adolescente 2013-2024 × 25 regiones, mortalidad materna 2000-2024 × 25, supervivencia infantil TMI/neonatal/posneonatal/1-4/TMM5 2001-2024 × 25)
- CNV vacunación: **1.399 filas (2024-2025)** cargadas pero **NO visibles** todavía en `/salud` (nombres legacy en `src/lib/indicator-names.ts`)
- Los volúmenes de otras categorías no fueron re-medidos en esta revisión
- Columnas: `id`, `indicador_nombre`, `categoria`, `valor`, `unidad`, `periodo`, `region`, `desglose` (JSONB), `fuente`, `ultima_actualizacion`, `activo`
- RLS: select público, insert/update/delete admin

### Tabla `repositorio`
- 16 archivos con metadata
- Columnas: `id`, `nombre`, `tipo`, `size`, `url`, `categoria`, `processed`, `total_chunks`, `last_processed_at`

### Tabla `doc_chunks`
- 7,541 chunks indexados
- Columnas: `id`, `repo_file_id`, `chunk_index`, `content`, `embedding` (vector 1536), `metadata`
- Índice IVFFlat para búsqueda por similitud coseno

### Tabla `fuentes`
- Catálogo de fuentes de datos con badges por categoría

---

## Links

| Recurso | URL |
|---------|-----|
| Dashboard (prod) | http://179.199.132.207/observatorio/ |
| Dashboard (legacy) | https://ddna-dashboard.vercel.app/ |
| GitHub | https://github.com/lucasalvador98/ddna-dashboard |
| Supabase (Cloud legacy) | https://supabase.com/dashboard/project/ppyyqrvirjqmfpqaqnxy |

---

## Configuración de desarrollo

```bash
git clone https://github.com/lucasalvador98/ddna-dashboard.git
cd ddna-dashboard
npm install
cp .env.local.example .env.local
# Editar .env.local con credenciales
npm run dev
```

### Variables de entorno requeridas

```env
# Self-hosted — producción (ver DEPLOY_TOPOLOGY.md)
NEXT_PUBLIC_SUPABASE_URL=http://179.199.132.207:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...
INTERNAL_API_SECRET=...       # para /api/admin/backfill
# Supabase Cloud — solo legacy Vercel y scripts de migración (scripts/*.mjs)
CLOUD_SUPABASE_URL=https://ppyyqrvirjqmfpqaqnxy.supabase.co
CLOUD_SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Decisiones técnicas

| Decisión | Elección | Razón |
|----------|----------|-------|
| Framework | Next.js 16 (App Router) | SSR/SSG, API routes, deploy Docker en VPS |
| Visualización | Recharts | Ligero, React-native, suficiente para KPIs |
| Base de datos | Supabase (PostgreSQL) | Auth, storage, API REST, pgvector |
| Vector DB | pgvector (Supabase) | Sin infraestructura extra, misma DB |
| LLM | OpenAI gpt-4o-mini | Único proveedor en el código; rápido y económico |
| Embeddings | OpenAI text-embedding-3-small | 1536 dims, $0.02/1M tokens |
| RLS | Público lectura, admin escritura | Seguridad por defecto, sin auth UI |
| N8N | Eliminado | Reemplazado por `/api/admin/backfill` |
| ETL / datos raw | Eliminados del repo | Datos ya cargados en Supabase |
| Scripts one-time con paths muertos | Eliminados | migrate-monitoreo, sync-monitoreo, process_*, load-uca-dimensions |
| SQLs generados por ETL | Eliminados | batches/ completo, .sql sueltos — ya ejecutados en Supabase |
