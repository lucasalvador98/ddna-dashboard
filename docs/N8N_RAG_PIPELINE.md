# N8N RAG Pipeline — Diseño y Plan de Trabajo

**Fecha**: 2026-05-14  
**Estado**: Diseño listo para implementar  
**Proyecto**: ddna-dashboard

---

## 🎯 Objetivo

Armar un pipeline en N8N que permita:
1. **Indexar automáticamente** cualquier documento nuevo subido al bucket de Supabase
2. **Dialogar con el Agente** sobre TODOS los documentos disponibles
3. Simular la experiencia de **NotebookLM** — subir archivo y chatear sobre el contenido

---

## 📊 Estado Actual del Repositorio

### Archivos en Supabase Storage

```
Bucket: ddna-repositorio (50MB limit)

PROCESADOS ✅ (el agente YA puede leerlos):
├── Base de datos 2021.xlsx        → 3,647 chunks
├── Base de datos Andrés.xlsx      → 3,276 chunks
├── Encuesta 2024.xlsx             → 599 chunks
├── Encuestas 2024.docx            → 7 chunks
├── Monitoreo Medios 2022.docx    → 10 chunks
└── Tablero general.docx           → 2 chunks

PENDIENTES ⏳ (NO indexados, agente NO puede leerlos):
├── Inversion_social_2010-2023.pdf       ⚠️ PRIORIDAD ALTA
├── Inversion_Social_Cordoba_2024.pdf    ⚠️ PRIORIDAD ALTA
├── ConsumosAdolescentes.pdf
├── Encuesta_Covid-19.pdf
├── Miremos_nuestras_emociones.pdf
└── Adolescencia_en_pandemia.pdf
```

### Tablas Involucradas

| Tabla | Uso |
|-------|-----|
| `repositorio` | Metadata de archivos (nombre, tipo, estado) |
| `doc_chunks` | Chunks de texto + embeddings (7,541 existentes) |
| `storage.ddna-repositorio` | Bucket con archivos originales |

---

## 🏗️ Arquitectura del Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                         N8N WORKFLOW RAG                             │
│                                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐     │
│  │ TRIGGER  │───►│DOWNLOAD  │───►│ EXTRACT  │───►│  CHUNK   │     │
│  │          │    │          │    │  TEXT    │    │  TEXT    │     │
│  │Webhook o │    │Supabase  │    │ PDF API  │    │ JS Code  │     │
│  │Schedule  │    │ Storage  │    │(external)│    │  Node    │     │
│  └──────────┘    └──────────┘    └──────────┘    └────┬─────┘     │
│                                                         │           │
│                                                         ▼           │
│                                                  ┌──────────┐     │
│                                                  │GENERATE  │     │
│                                                  │EMBEDDING │     │
│                                                  │  Groq    │     │
│                                                  └────┬─────┘     │
│                                                       │           │
│                                                       ▼           │
│                                                  ┌──────────┐     │
│                                                  │  SAVE    │     │
│                                                  │ TO       │     │
│                                                  │ Supabase │     │
│                                                  └──────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Decisiones de Diseño

### Stack 100% Externo
- **PDF Extraction**: `n8n-nodes-pdf-api-hub` (usa servicio externo con OCR)
- **Embeddings**: Groq API (gratis, 30 req/min)
- **Storage**: Supabase (ya configurado)
- **Orquestación**: N8N (solo orquesta, no procesa localmente)

### Ventajas
- ✅ No requiere instalar dependencias en servidor N8N
- ✅ OCR de calidad para PDFs escaneados
- ✅ N8N liviano, solo orquestación
- ✅ Escalable
- ✅ Si N8N cae, no afecta procesamiento

---

## 📁 Workflows Necesarios

### Workflow 1: Backfill (una sola vez)
**Propósito**: Indexar los 6 PDFs pendientes

```
Trigger: Manual (Schedule → Run Once)
↓
List all files in bucket
↓
Loop over each file
  ↓
  Download file
  ↓
  Extract text (PDF API Hub con OCR)
  ↓
  Chunk text (500 tokens, 20% overlap)
  ↓
  Generate embeddings (Groq)
  ↓
  Batch insert to doc_chunks
  ↓
  Update repositorio (processed=true, total_chunks=N)
```

### Workflow 2: Ongoing (permanente)
**Propósito**: Indexar automáticamente archivos nuevos

```
Trigger: Supabase Storage Webhook
↓
Download new file
↓
Extract text (según tipo: PDF/DOCX/XLSX/TXT/MD)
↓
Chunk text
↓
Generate embedding
↓
Save to doc_chunks
↓
Update repositorio (processed=true)
↓
Optional: Notify frontend (Realtime)
```

---

## 🔌 Nodos N8N Requeridos

### Community Nodes a Instalar

```bash
# En el servidor N8N:
npm install n8n-nodes-pdf-api-hub
npm install @n8n/n8n-nodes-langchain  # Para embeddings
```

### Nodos Nativos Usados
- **Supabase Node** → Descarga y guardado
- **HTTP Request** → Llamadas a APIs externas
- **Code Node** → Chunking y transformación
- **Webhook** → Triggers

---

## 📋 Formato de Chunk

```typescript
interface DocChunk {
  repo_file_id: string;  // UUID del archivo en repositorio
  chunk_index: number;   // Orden del chunk
  content: string;       // Texto del chunk
  embedding: number[];   // Vector de embedding
  metadata: {
    source: string;      // Nombre del archivo
    type: string;        // pdf, docx, txt, etc.
    chunk_size: number;  // Tokens aprox
    processed_at: string; // ISO timestamp
  };
}
```

**Parámetros de chunking:**
- Max tokens por chunk: 500
- Overlap entre chunks: 20% (100 tokens)
- Separador: Párrafo cuando sea posible

---

## 🔐 APIs Externas Requeridas

### Groq (Embeddings)
```bash
# API Key: Stored in N8N credentials
# Endpoint: https://api.groq.com/openai/v1/embeddings
# Model: embed-english-v3.0 o similar (gratis)
# Rate limit: 30 requests/min
```

### PDF API Hub (OCR + Extracción)
```bash
# Servicio: n8n-nodes-pdf-api-hub
# Incluye OCR con Tesseract
# Soporta: texto, tablas, imágenes
# Languages: español incluido
```

---

## ✅ Checklist de Implementación

- [ ] 1. Instalar `n8n-nodes-pdf-api-hub` en N8N
- [ ] 2. Configurar credenciales de Groq en N8N
- [ ] 3. Crear Workflow de Backfill (indexar 6 PDFs)
- [ ] 4. Ejecutar Backfill
- [ ] 5. Crear Workflow Ongoing (webhook trigger)
- [ ] 6. Configurar Supabase Storage webhook
- [ ] 7. Probar con un archivo nuevo
- [ ] 8. Verificar en chat que el agente responde sobre el documento

---

## 📝 Notas para Continuar

1. **Groq ya está usado** en el proyecto (`src/app/api/agent/chat/route.ts`). Revisar cómo se generan embeddings ahí para reutilizar lógica.

2. **El agente ya tiene la tool `search_knowledge_base`** que busca en `doc_chunks`. Una vez indexado, funciona automático.

3. **Los 7 documentos ya procesados** (xlsx, docx) no requieren reindexación.

4. **PDFs son prioritarios** porque suelen contener informes/investigaciones de valor.

---

## 🔗 Archivos Relacionados

- `docs/AGENT_ARCHITECTURE.md` — Arquitectura del agente
- `src/lib/use-dashboard-data.ts` — Hook de datos
- `src/app/api/agent/` — APIs del agente

---

## 👤 Contacto para Continuar

Si seguís desde otro equipo:
1. Pull último del repo
2. Revisá este documento
3. Chequeá el estado de N8N (¿corriendo? ¿dónde?)
4. Empezá por el Workflow de Backfill

---

*Documento generado: 2026-05-14*