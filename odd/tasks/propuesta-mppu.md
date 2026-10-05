# Feature: propuesta-mppu

## Objetivo

Preparar y presentar la propuesta al **Terms of Reference for the Global Collective
Intelligence Platform** de **MPPU ("One Planet, One Humanity")** — plataforma web
responsiva para ~600 miembros con 6 módulos, en rol de **prime contractor**, apoyada
en la **integración de OSS maduro** y en la evidencia verificable del Tablero DDNA.

## Decisión tomada

**Prime contractor de los 6 módulos, por integración — no por construcción desde cero.**

El ToR pide 6 *módulos*, no 6 *productos*. Los módulos donde no tenemos experiencia
están resueltos por componentes OSS con años de madurez; el trabajo real es
integración, SSO, datos y cumplimiento. Construir el módulo social desde cero
sería la peor decisión posible: carísimo, con años de deuda y sin diferencial.

## Estrategia de arquitectura

Una sola plataforma sobre **Supabase self-hosted** (Auth, Storage, Realtime,
pgvector) — ya probado por nosotros en producción.

| # | Módulo del ToR | Enfoque | Componente / base |
|---|---|---|---|
| 1 | Global Community | **Adoptar** | Discourse (perfiles, foros, mensajería, notificaciones) con SSO contra Supabase Auth |
| 2 | Knowledge Hub | **Propio** | Repositorio documental + pgvector (ya construido) |
| 3 | Data Lab | **Propio** | Tablero de indicadores + Recharts/Leaflet (ya construido) |
| 4 | Collaborative Lab | **Adoptar** | Yjs/Hocuspocus + Tiptap, o Nextcloud/OnlyOffice si exigen auto-hospedaje puro |
| 5 | AI Creation Studio | **Propio + capa IA** | RAG existente + generación de contenido, traducción, guía de uso responsable |
| 6 | Action & Amplification | **Propio (frontend + datos)** | Feed de iniciativas, campañas, métricas de difusión |

## Evidencia reutilizable (verificable)

| Requisito textual del ToR | Evidencia en el Tablero |
|---|---|
| "verifiable citations to hosted sources" | RAG sobre 7.541 chunks, índice IVFFlat, badges clickeables a fuentes |
| "upload, classification, and search; semantic search" | Auto-indexing: extracción → chunking → embeddings → `search_doc_chunks` |
| "sources and indicators; charts, tables, and maps; export" | 11 secciones temáticas en producción, Recharts + Leaflet (`/geo`), KPIs interanuales, informe ejecutivo |
| "model-agnostic integration layer" | Groq (Llama 3.1) con fallback a OpenAI, en producción |
| "open technologies" + "infrastructure accounts owned by the organization" | Supabase self-hosted en VPS propia; migración desde Power BI propietario a soberanía de datos |
| "access controls" | Auth + RBAC completo: roles, permisos por pantalla, middleware, `LoginGate` role-aware |

## Brechas duras (bloquean la presentación si no se cierran)

1. **GDPR** — sin DPO, sin registro de tratamiento, sin DPIA, sin flujo de derechos
   del interesado. Con miembros de la UE es **requisito duro**, no un checkbox.
2. **Backups y monitoreo** — el ToR los pide explícitamente. Hoy no hay evidencia
   documentada de respaldo ni de monitoreo.
3. **Equipo nombrado + SLAs + capacitación + soporte post-lanzamiento** — el ToR
   exige equipo, metodología, cronograma, niveles de servicio y supuestos/exclusiones.
   Es capacidad de empresa, no de código.
4. **Escala realtime** — 600 usuarios con mensajería y edición colaborativa es otra
   liga arquitectónica. No hay medición que la respalde.
5. **Multilenguaje** — hoy es es-AR, dominio provincial. El ToR es internacional.

## Alcance

- **F0 — Go/no-go**: leer el pliego completo (plazos, moneda, forma jurídica,
  garantías, requisitos excluyentes). *No sabemos todavía si es adjudicable por
  nosotros ni cuándo cierra.*
- **F1 — Evidencia + demo**: capturas de producción, métricas, y demo guionado del
  RAG citando fuentes en vivo (3 minutos).
- **F2 — Arquitectura de referencia** de los 6 módulos: diagrama, SSO entre
  Discourse y Supabase, modelo de datos compartido, ADRs.
- **F3 — Evaluación OSS con prueba real**: levantar los candidatos en infra de
  prueba y verificar en español, no en paper.
- **F4 — Modelo de costos itemizado**: desarrollo, infraestructura, uso de IA,
  mantenimiento y mejoras futuras (los 5 rubros que pide el ToR).
- **F5 — Plan GDPR**: consultor/DPO, registro de tratamiento, DPIA, derechos del
  interesado, retención.
- **F6 — Equipo y propuesta comercial**: CVs, metodología, cronograma, SLAs,
  capacitación, supuestos y exclusiones.
- **F7 — Armado final y revisión** antes de enviar.

## Riesgos

- **Presentarse como prime sin DPO ni SLA** → riesgo de descalificación o de quedar
  expuesto contractualmente. Es la decisión más cara de todas.
- **El costo de IA es el rubro más subestimado**: hoy el RAG sirve a una
  organización provincial; a 600 usuarios el gasto variable de tokens puede superar
  el de infraestructura. Hay que modelarlo con supuestos explícitos.
- **"600 miembros" ≠ "600 concurrentes"**: declarar el supuesto y no
  sobredimensionar ni la infra ni el costo. Si se declara mal, se pierde por precio
  o se pierde plata al ejecutar.
- **Discourse/Nextcloud en nuestra infra**: probar antes de prometer (idioma,
  SSO, backups, upgrades).
- **Supabase self-hosted no es multi-tenant por defecto**: si MPPU exige
  aislamiento por organización, hay trabajo adicional y hay que cotizarlo.
- **No hay registro previo de MPPU** ni en el repo ni en memoria: no hay relación
  previa, ni contexto de contacto, ni interlocutor identificado.

## Preguntas abiertas (las decide el usuario, no yo)

- ¿Se presenta el equipo solo, o en consorcio con un prime legal y nosotros como
  líder técnico?
- ¿Hay capacidad real de cubrir GDPR con un consultor/DPO? Si no, ¿se presenta con
  exclusión explícita o no se presenta?
- ¿Cuál es la fecha de cierre y la moneda de cotización?

## Tareas

- [ ] T1 — Go/no-go: leer el pliego completo y verificar requisitos excluyentes,
      plazos, forma jurídica, moneda y garantías.
- [ ] T2 — Documento de evidencia + demo guionado del RAG citando fuentes.
- [ ] T3 — Arquitectura de referencia de los 6 módulos (diagrama, SSO, ADRs).
- [ ] T4 — Evaluación de los OSS candidatos con prueba real en infra de prueba.
- [ ] T5 — Modelo de costos itemizado (dev, infra, IA, mantenimiento, mejoras).
- [ ] T6 — Plan GDPR: DPO/consultor, registro de tratamiento, DPIA, derechos.
- [ ] T7 — Equipo nombrado, CVs, metodología, cronograma, SLAs, capacitación,
      supuestos y exclusiones.
- [ ] T8 — Armado y revisión final de la propuesta antes de enviar.
