# RAG Agent - Repositorio DDNA

**Fecha**: 2026-04-30  
**Estado**: En progreso  
**Objetivo**: Chat con documentos propios de la Defensoría usando RAG (Retrieval-Augmented Generation)

---

## 🎯 Objetivo

Crear un agente conversacional que pueda responder preguntas sobre la bibliografía de la DDNA, usando los documentos almacenados en el bucket `ddna-repositorio` de Supabase.

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND - /repositorio/chat                      │
│  └─ Chat UI (input + respuestas + fuentes citadas) │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│  API - /api/repositorio/chat                       │
│  ├── 1. Embed query (vectorizar pregunta)          │
│  ├── 2. Search similar docs (pgvector)            │
│  ├── 3. Call LLM with context                     │
│  └── 4. Return answer + source citations          │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│  SUPABASE                                         │
│  ├── Storage: ddna-repositorio (PDF, DOCX, XLSX)│
│  ├── Tabla: repositorio (metadata)                │
│  ├── Tabla: doc_chunks (texto + embedding)        │
│  └── pgvector extension                          │
└─────────────────────────────────────────────────────┘
```

---

## 📋 Pipeline de Datos

### Fase 1: Ingesta de Documentos
1. Subir archivo a Storage (`ddna-repositorio`)
2. Extraer texto según tipo:
   - PDF → `pdfjs-dist` o API externa
   - DOCX → `mammoth` (Node.js)
   - XLSX → `xlsx` (ya disponible en ETL)
3. Dividir en chunks (tamaño: 500-1000 tokens, overlap: 100)
4. Generar embedding de cada chunk
5. Guardar en `doc_chunks` con metadata

### Fase 2: Consulta (RAG)
1. Usuario hace pregunta
2. Embed de la pregunta → vector
3. Búsqueda en `doc_chunks` usando `<->` (cosine distance)
4. Recuperar top-K chunks más similares
5. Construir prompt con contexto
6. Llamar a LLM (OpenAI/Anthropic/local)
7. Devolver respuesta + fuentes

---

## 🗄️ Esquema de Base de Datos

### Tabla: `doc_chunks`

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Chunks de documentos con embeddings
CREATE TABLE doc_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_file_id UUID REFERENCES repositorio(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),  -- OpenAI text-embedding-3-small
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(repo_file_id, chunk_index)
);

-- Index for vector search
CREATE INDEX idx_doc_chunks_embedding 
ON doc_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for file lookup
CREATE INDEX idx_doc_chunks_file_id 
ON doc_chunks(repo_file_id);
```

### Tabla: `repositorio` (ya existe, agregar campos)

```sql
ALTER TABLE repositorio 
ADD COLUMN IF NOT EXISTS processed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS total_chunks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_processed_at TIMESTAMPTZ;
```

---

## 🔧 Stack Tecnológico

| Componente | Tecnología | Notas |
|------------|-------------|-------|
| **Embeddings** | OpenAI API | `text-embedding-3-small` (1536 dim) |
| **LLM** | OpenAI API | `gpt-4o-mini` o `gpt-4o` |
| **Vector DB** | pgvector (Supabase) | Extension nativa |
| **Text extraction** | `pdfjs-dist`, `mammoth` | Según tipo de archivo |
| **Chunking** | Custom splitter | Por párrafos/tokens |
| **Frontend** | React + Tailwind | Reutilizar diseño DDNA |

---

## 📂 Estructura de Archivos a Crear

```
src/
  app/
    repositorio/
      page.tsx              ← Lista de archivos (YA EXISTE)
      chat/
        page.tsx            ← NUEVO: Chat UI
  api/
    repositorio/
      upload/route.ts       ← YA EXISTE
      chat/route.ts         ← NUEVO: Endpoint RAG
      process/route.ts      ← NUEVO: Procesa documentos
  lib/
    rag/
      embedder.ts          ← NUEVO: Genera embeddings
      chunker.ts           ← NUEVO: Divide texto en chunks
      extractors/
        pdf.ts             ← NUEVO: Extrae texto de PDF
        docx.ts            ← NUEVO: Extrae texto de DOCX
        xlsx.ts            ← NUEVO: Extrae texto de XLSX
```

---

## 🚀 Plan de Implementación

### ✅ Fase 1: Base de Datos (COMPLETADO ✅ 2026-04-30)
- [x] Habilitar extensión `pgvector` en Supabase
- [x] Crear tabla `doc_chunks`
- [x] Agregar campos a `repositorio`
- [x] Verificar conexión y permisos
- [x] Índices para búsqueda vectorial creados

### ✅ Fase 2: Procesamiento (COMPLETADO ✅ 2026-04-30)
- [x] Instalar dependencias (`pdfjs-dist`, `mammoth`, `openai`)
- [x] Implementar embedder (`src/lib/rag/embedder.ts`)
- [x] Implementar chunker (`src/lib/rag/chunker.ts`)
- [x] Extractores de texto:
  - [x] PDF (`src/lib/rag/extractors/pdf.ts`)
  - [x] DOCX (`src/lib/rag/extractors/docx.ts`)
  - [x] XLSX (`src/lib/rag/extractors/xlsx.ts`)
- [ ] Endpoint `/api/repositorio/process` para procesar archivos

### ✅ Fase 3: RAG API (COMPLETADO ✅ 2026-04-30)
- [x] Implementar embedder (`src/lib/rag/embedder.ts`)
- [x] Endpoint `/api/repositorio/process` para procesar archivos
- [x] Endpoint `/api/repositorio/chat` para consultas RAG
- [x] Función SQL `search_doc_chunks` para búsqueda vectorial
- [x] Integración con OpenAI API (embeddings + LLM)

### ✅ Fase 4: UI (COMPLETADO ✅ 2026-04-30)
- [x] Chat UI en `/repositorio/chat/page.tsx`
- [x] Mostrar fuentes citadas
- [ ] Streaming de respuestas (pendiente - opcional)

---

## 📝 Notas de Implementación - Sesión 2026-04-30

### Archivos Creados:
1. `docs/RAG_AGENT_ARCHITECTURE.md` - Esta documentación
2. `src/lib/rag/embedder.ts` - Generador de embeddings
3. `src/lib/rag/chunker.ts` - Divisor de texto en chunks
4. `src/lib/rag/extractors/pdf.ts` - Extractor PDF
5. `src/lib/rag/extractors/docx.ts` - Extractor DOCX
6. `src/lib/rag/extractors/xlsx.ts` - Extractor XLSX
7. `src/app/api/repositorio/process/route.ts` - API de procesamiento
8. `src/app/api/repositorio/chat/route.ts` - API del chat RAG
9. `src/app/repositorio/chat/page.tsx` - UI del chat

### Cambios en Supabase:
- ✅ Extensión `vector` habilitada
- ✅ Tabla `doc_chunks` creada con columna `embedding vector(1536)`
- ✅ Campos agregados a `repositorio`: `processed`, `total_chunks`, `last_processed_at`
- ✅ Índices para búsqueda vectorial creados
- ✅ Función `search_doc_chunks` para búsqueda RPC creada

### Dependencias Instaladas:
- `pdfjs-dist` - Para extracción de PDF
- `mammoth` - Para extracción de DOCX
- `openai` - Para embeddings y LLM

### Variables de Entorno Requeridas:
```env
OPENAI_API_KEY=sk-...  # Para embeddings y GPT-4o-mini
```

### Próximos Pasos (para continuar en otro dispositivo):
1. **Configurar OPENAI_API_KEY** en `.env.local`
2. **Subir documentos** a `/repositorio` (se guardan en bucket `ddna-repositorio`)
3. **Procesar documentos**: Llamar a `POST /api/repositorio/process` con `{ fileId: "<uuid>" }`
4. **Probar el chat**: Ir a `/repositorio/chat` y hacer preguntas
5. **Opcional**: Implementar streaming de respuestas

### Cómo Probar:
```bash
# 1. Subir un documento PDF desde /repositorio
# 2. Obtener el ID del archivo de la tabla `repositorio`
# 3. Procesar:
curl -X POST http://localhost:3000/api/repositorio/process \
  -H "Content-Type: application/json" \
  -d '{"fileId": "uuid-del-archivo"}'

# 4. Probar el chat en http://localhost:3000/repositorio/chat
```

---

## ⚠️ IMPORTANTE: Pendientes Críticos

1. **OPENAI_API_KEY**: Sin esta variable, NO funciona el sistema RAG
2. **Procesamiento de documentos**: Los archivos subidos NO se procesan automáticamente. Hay que llamar al endpoint `/process` manualmente (o crear un webhook)
3. **RLS en doc_chunks**: Se creó política de lectura pública. Ajustar si se requiere auth

---

*Última actualización: 2026-04-30 - Listo para continuar en otro dispositivo*  
*Autor: Lucas + AI Assistant*

---

## 🔐 Variables de Entorno Necesarias

```env
# OpenAI (para embeddings y LLM)
OPENAI_API_KEY=sk-...

# Opcional: otro proveedor
# COHERE_API_KEY=...
# ANTHROPIC_API_KEY=...

# Supabase (ya configurado)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 📝 Notas de Implementación

### Chunking Strategy
- **Tamaño**: 500-1000 tokens (~2000-4000 caracteres)
- **Overlap**: 10-15% del tamaño del chunk
- **División**: Por párrafos, luego por oraciones, finalmente por caracteres

### Embedding Strategy
- **Modelo**: `text-embedding-3-small` (OpenAI)
- **Dimensiones**: 1536
- **Costo**: $0.02 por 1M tokens (muy económico)

### Vector Search
```sql
-- Búsqueda de similitud coseno
SELECT *, 
       1 - (embedding <=> '[query_embedding]') as similarity
FROM doc_chunks
WHERE 1 - (embedding <=> '[query_embedding]') > 0.7
ORDER BY embedding <=> '[query_embedding]'
LIMIT 5;
```

---

## 🐛 Troubleshooting

### Error: "extension vector not found"
Ejecutar en Supabase SQL Editor: `CREATE EXTENSION vector;`

### Error: "dimension mismatch"
Verificar que el modelo de embedding y la columna tengan las mismas dimensiones.

### Costos de API
- Usar batching para embeddings (máx 2048 inputs por request)
- Cachear embeddings de preguntas frecuentes

---

*Última actualización: 2026-04-30*  
*Autor: Lucas + AI Assistant*
