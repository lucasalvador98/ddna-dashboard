# Plan de Deployment — Dockerización para Hostinger VPS

> **Estado**: Pendiente
> **Última actualización**: 2026-07-30
> **Objetivo**: Empaquetar el dashboard en Docker para deployarlo en una VPS Hostinger

---

## 📋 Contexto

- **Stack actual**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 + Supabase
- **App**: `ddna-dashboard` (Defensoría de Niños, Niñas y Adolescentes de Córdoba)
- **Target**: VPS Hostinger (Linux, Docker disponible)
- **Fuente**: Repo GitHub `lucasalvador98/ddna-dashboard`

### Dependencias clave que afectan el deploy
- `next: 16.2.3` — usa `output: 'standalone'` para Docker
- `cheerio`, `mammoth`, `pdf-parse`, `pptxgenjs`, `xlsx` — librerías con binarios nativos
- `plotly.js` — bundle pesado (~3MB), cuidado con el tamaño de imagen
- `playwright` — solo dev, no debe ir a producción
- `@playwright/mcp` — solo dev

---

## 🎯 Fases del plan

### Fase 0 — Análisis previo (1h)
- [ ] Revisar uso de memoria en build (plotly es pesado)
- [ ] Identificar todos los endpoints API que necesitan `INTERNAL_API_SECRET`
- [ ] Listar todas las variables de entorno requeridas (ver `.env.local.example`)
- [ ] Verificar si hay cron jobs o procesos en background (scripts de carga)
- [ ] Revisar requirements de sistema: Node 20+, RAM para build, espacio en disco

**Output**: Lista completa de env vars y servicios externos

---

### Fase 1 — Dockerfile multi-stage (2-3h)

**Objetivo**: Imagen Docker optimizada para producción

#### 1.1 Crear `Dockerfile` (raíz del proyecto)
- [ ] **Stage 1 `deps`**: `node:20-alpine` + `npm ci`
- [ ] **Stage 2 `builder`**: copia deps, copia código, `npm run build`
- [ ] **Stage 3 `runner`**: imagen final mínima (`node:20-alpine`)
  - Copiar `.next/standalone`
  - Copiar `.next/static`
  - Copiar `public/`
  - Usuario no-root (`node`)
  - Exponer puerto 3000
  - Healthcheck endpoint
- [ ] Configurar `next.config.ts` con `output: 'standalone'`

#### 1.2 Crear `.dockerignore`
- [ ] Excluir `node_modules`, `.next`, `.git`, `.env*`
- [ ] Excluir tests: `e2e/`, `coverage/`, `*.test.*`
- [ ] Excluir docs: `docs/`, `README.md`, etc.
- [ ] Excluir binarios del SO: `nul`, `.DS_Store`

#### 1.3 Optimizaciones
- [ ] Layer caching: copiar `package*.json` primero
- [ ] Usar `npm ci --omit=dev` en deps (no instalar playwright)
- [ ] `NODE_ENV=production` en runtime
- [ ] Multi-arch build (amd64 + arm64) opcional

**Output**: `Dockerfile` + `.dockerignore` + `next.config.ts` con standalone

---

### Fase 2 — Docker Compose para desarrollo (1-2h)

**Objetivo**: Levantar el proyecto localmente con un solo comando

#### 2.1 Crear `docker-compose.yml`
- [ ] Servicio `app`:
  - Build desde Dockerfile
  - Variables de entorno desde `.env.local` (o `.env.production`)
  - Puerto 3000 publicado
  - Volume opcional para hot-reload en dev
  - `depends_on` si hay otros servicios
- [ ] Servicio `redis` (opcional, para rate limiting del chat)
- [ ] Servicio `nginx` (opcional, reverse proxy)

#### 2.2 Crear `docker-compose.prod.yml` (override)
- [ ] Sin volumes de hot-reload
- [ ] Restart policy `unless-stopped`
- [ ] Logging con rotación

#### 2.3 Scripts npm nuevos
```json
"docker:dev": "docker compose up app",
"docker:build": "docker compose build",
"docker:prod": "docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d"
```

**Output**: `docker-compose.yml` + `docker-compose.prod.yml` + scripts

---

### Fase 3 — Configuración para producción (2h)

**Objetivo**: App lista para correr en VPS

#### 3.1 Variables de entorno
- [ ] Documentar todas las vars en `.env.production.example`
- [ ] Marcar cuáles son secret (no commitear)
- [ ] Crear checklist de vars requeridas:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (secret)
  - `OPENAI_API_KEY` (secret)
  - `GROQ_API_KEY` (secret)
  - `INTERNAL_API_SECRET` (secret)
  - `NODE_ENV=production`

#### 3.2 Healthcheck
- [ ] Crear `/api/health/route.ts` que devuelva `{ status: 'ok', timestamp }`
- [ ] Configurar healthcheck en Docker: `HEALTHCHECK CMD curl -f http://localhost:3000/api/health`

#### 3.3 Logging
- [ ] Configurar logger a stdout/stderr (para que Docker lo capture)
- [ ] Reemplazar `console.log` con logger estructurado donde sea crítico
- [ ] Variables: `LOG_LEVEL=info`

#### 3.4 Manejo de procesos
- [ ] Verificar que no haya timers/cron in-process (todo debe ser stateless)
- [ ] Si hay scripts de carga (presupuesto, indicadores), corren **fuera** del container

**Output**: `.env.production.example` + `/api/health` + logging configurado

---

### Fase 4 — Reverse proxy + HTTPS (2-3h)

**Objetivo**: App accesible vía dominio con HTTPS

#### 4.1 Nginx reverse proxy
- [ ] Crear `nginx/nginx.conf`
- [ ] Proxy pass a `app:3000`
- [ ] Headers: `X-Forwarded-For`, `X-Real-IP`
- [ ] Buffer settings para uploads grandes
- [ ] Rate limiting básico

#### 4.2 HTTPS con Let's Encrypt
- [ ] Opción A: certbot en el host (recomendado)
- [ ] Opción B: Caddy automático
- [ ] Configurar auto-renewal

#### 4.3 Dominio
- [ ] DNS A record → IP de la VPS
- [ ] Variables: `DOMAIN=ddna.example.com`

**Output**: `nginx.conf` + certbot config + DNS

---

### Fase 5 — Deploy en VPS Hostinger (2-3h)

**Objetivo**: App corriendo y accesible públicamente

#### 5.1 Setup inicial de la VPS
- [ ] Instalar Docker + Docker Compose
- [ ] Crear usuario no-root
- [ ] Configurar SSH key
- [ ] Firewall (ufw): solo 22, 80, 443

#### 5.2 Deploy
- [ ] Clonar repo: `git clone https://github.com/lucasalvador98/ddna-dashboard.git`
- [ ] Crear `.env.production` con valores reales
- [ ] `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build`
- [ ] Verificar logs: `docker compose logs -f app`
- [ ] Verificar healthcheck: `curl https://dominio/api/health`

#### 5.3 CI/CD (opcional, futuro)
- [ ] GitHub Actions: build + push a Docker Hub / GHCR
- [ ] Webhook para auto-deploy
- [ ] Rollback strategy

**Output**: App corriendo en `https://dominio`

---

### Fase 6 — Monitoreo y mantenimiento (ongoing)

#### 6.1 Monitoring
- [ ] Uptime monitoring (UptimeRobot, free)
- [ ] Logs centralizados (papertrail, free tier)
- [ ] Alertas básicas (email cuando container cae)

#### 6.2 Backups
- [ ] Snapshots del filesystem
- [ ] Backup de env vars (Vault, 1Password)
- [ ] Documentar proceso de restore

#### 6.3 Updates
- [ ] Proceso de deploy de nueva versión
- [ ] Database migrations (Supabase dashboard)
- [ ] Rollback: `git checkout` + rebuild

---

## 📁 Archivos a crear (resumen)

```
.
├── Dockerfile                              # FASE 1
├── .dockerignore                           # FASE 1
├── docker-compose.yml                      # FASE 2
├── docker-compose.prod.yml                 # FASE 2
├── .env.production.example                 # FASE 3
├── src/app/api/health/route.ts             # FASE 3
├── nginx/
│   ├── nginx.conf                          # FASE 4
│   └── Dockerfile                          # FASE 4
├── scripts/
│   ├── deploy.sh                           # FASE 5
│   └── backup.sh                           # FASE 6
└── .github/workflows/
    └── deploy.yml                          # FASE 5 (futuro)
```

---

## ⚠️ Riesgos identificados

| Riesgo | Mitigación |
|---|---|
| **Plotly bundle pesado** (3MB) | Considerar lazy load del componente de charts pesados |
| **RAM en VPS Hostinger** (típico 2-4GB) | Configurar límites de memoria, swap, monitoring |
| **Secrets en git** | `.env.production` nunca commiteado, documentar proceso de setup |
| **Build failures por libs nativas** (mammoth, pdf-parse) | Usar `node:20-alpine` con build deps o cambiar a `node:20-slim` |
| **HTTPS expirado** | Auto-renewal con cron + certbot |
| **Cold start del contenedor** | Configurar `start_period` en healthcheck |

---

## 📊 Estimación de tiempo

| Fase | Horas | Dependencias |
|---|---|---|
| 0 - Análisis | 1h | — |
| 1 - Dockerfile | 2-3h | Fase 0 |
| 2 - Compose | 1-2h | Fase 1 |
| 3 - Producción | 2h | Fases 1, 2 |
| 4 - Nginx + HTTPS | 2-3h | Fase 3 |
| 5 - Deploy VPS | 2-3h | Fases 1-4 |
| 6 - Monitoreo | ongoing | Fase 5 |
| **Total** | **~12-16h** | |

---

## 🚦 Orden de ejecución recomendado

1. **Hoy** (cuando se decida deployar):
   - Fase 0 (análisis)
   - Fase 1 (Dockerfile)
   - Fase 2 (Compose)

2. **Después**:
   - Fase 3 (env vars + healthcheck)
   - Test local con `docker compose up`

3. **Pre-producción**:
   - Fase 4 (Nginx + HTTPS)
   - Fase 5 (deploy en VPS)

4. **Post-producción**:
   - Fase 6 (monitoreo continuo)

---

## 📝 Decisiones a tomar

Antes de empezar, responder:

- [ ] **¿Qué dominio usaremos?** (ej: `ddna.example.com`)
- [ ] **¿VPS con cuánto RAM?** (mínimo 2GB, recomendado 4GB)
- [ ] **¿HTTPS con certbot o Caddy?**
- [ ] **¿Incluir Redis para rate limiting o no?**
- [ ] **¿CI/CD ahora o después?**
- [ ] **¿Logs centralizados desde el inicio?**
- [ ] **¿Migrar la DB de Supabase a un VPS propio o mantener Supabase?**

---

## 🔗 Referencias

- [Next.js Docker deployment](https://nextjs.org/docs/app/api-reference/config/next-config-js/output#standalone)
- [Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Hostinger VPS docs](https://www.hostinger.com/tutorials/vps)
- [Let's Encrypt + Nginx](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-22-04)

---

**Próximo paso sugerido**: Cuando se decida ejecutar el plan, empezar por **Fase 0** (análisis de env vars y endpoints) y **Fase 1** (Dockerfile con multi-stage build).
