# Deployment Plan — Docker for Hostinger VPS

> ⚠️ **DOCUMENTO HISTÓRICO — NO USAR COMO PROCEDIMIENTO DE DEPLOY.**
> Describe cómo se desplegó en agosto de 2026, cuando el tablero era dueño del
> puerto 80. El deploy vigente lo hace el DevOps con
> `/home/deploy/ddna-infra/build-dashboard.py` sobre la VPS self-hosted;
> ver [`DEPLOY_TOPOLOGY.md`](./DEPLOY_TOPOLOGY.md) y [`AGENTS.md`](./AGENTS.md).
> **`deploy.sh` está CONGELADO y ROTO** (ver §Deployment).
>
> **Status**: histórico — superado por el flujo de `DEPLOY_TOPOLOGY.md`
> **Last updated**: 2026-08-27 (contenido original)
> **Goal**: Package the dashboard in Docker for deployment on Hostinger VPS
> **VPS IP**: 179.199.132.207

---

## Context

- **Current stack**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 + Supabase
- **App**: `ddna-dashboard` (Defensoría de Niños, Niñas y Adolescentes de Córdoba)
- **Target**: Hostinger VPS KVM 2 (2 vCPU / 4GB RAM / Ubuntu 24.04)
- **Source**: GitHub repo `lucasalvador98/ddna-dashboard`
- **Database**: Supabase **self-hosted** en la misma VPS (API: `http://179.199.132.207:8000`). El proyecto Cloud `ppyyqrvirjqmfpqaqnxy` solo alimenta el deploy legacy de Vercel y los scripts de migración.

### Key dependencies affecting deployment
- `next: 16.4.0` — uses `output: 'standalone'` for Docker
- `cheerio`, `mammoth`, `pdf-parse`, `pptxgenjs`, `xlsx` — pure JavaScript libraries
- `recharts` — bundle size consideration (~200KB gzipped)
- `playwright` — dev only, not included in production image
- `@tailwindcss/postcss` — devDependency required during build (see Dockerfile fix)

---

## VPS Setup (Completed)

### System configuration
- **User**: `deploy` (sudo enabled)
- **Firewall**: ufw — ports 22 (SSH), 80 (HTTP), 443 (HTTPS) open
- **Swap**: 2GB at `/swapfile` (vm.swappiness=10)
- **Docker**: Docker Engine 29.7.2 + Docker Compose

### SSH access
```powershell
ssh deploy@179.199.132.207
```
Password authentication enabled. Root login disabled.

---

## Environment Variables

| Variable | Required | Secret | Source |
|----------|----------|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | No | Supabase dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | No | Supabase dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Yes | Supabase dashboard → Settings → API |
| `OPENAI_API_KEY` | Yes | Yes | platform.openai.com → API Keys (LLM `gpt-4o-mini` + embeddings) |
| `INTERNAL_API_SECRET` | Yes | Yes | Generated per-deploy (`openssl rand -hex 32`) |
| `NEXT_PUBLIC_BASE_PATH` | Yes | No | `/observatorio` en producción. **Se hornea en BUILD time**: sin esto, todo `/observatorio/*` da 404 |
| `NODE_ENV` | Yes | No | Set to `production` |

⚠️ **Never commit `.env.production` or `.env.local` to git.**

---

## Docker Architecture

### Dockerfile (3-stage multi-stage build)

```
Stage 1: deps (node:20-alpine)
  └─ npm ci (ALL dependencies, including dev for build)

Stage 2: builder (node:20-alpine)
  └─ Copy deps + source → npm run build
  └─ Env vars passed via ARG/ENV for Supabase connectivity during build

Stage 3: runner (node:20-alpine)
  └─ Copy .next/standalone + static + public
  └─ Non-root user (nextjs:nodejs, UID 1001)
  └─ HEALTHCHECK via wget to /api/health
  └─ Exposes port 3000
```

### Docker Compose files

| File | Purpose | Key features |
|------|---------|--------------|
| `docker-compose.yml` | Development | Hot-reload volumes, port 3000, .env.local |
| `docker-compose.prod.yml` | Histórico | Build args para env vars, publica `80:3000`, restart policy. **No lo usa el deploy activo** y **no define `NEXT_PUBLIC_BASE_PATH`**, por eso compila `basePath: ""` y rompe `/observatorio/*`. |

### Important Dockerfile fix
The initial build failed because `@tailwindcss/postcss` is a devDependency. The `deps` stage must use `npm ci` (without `--omit=dev`) so the builder stage has all dependencies needed for `next build`.

---

## Deployment

### Estado actual del deploy (vigente)

El deploy del tablero **no** usa las instrucciones de abajo. Lo hace el DevOps con
`/home/deploy/ddna-infra/build-dashboard.py`:

- Buildea desde el checkout limpio `/home/deploy/ddna-dashboard-observatorio`.
- Pasa `NEXT_PUBLIC_BASE_PATH=/observatorio` (desde `secrets/dashboard-build.env`).
- Taguea la imagen `ddna-dashboard:observatorio-candidate` y escribe la provenance
  en `dashboard-build-inputs.json`.
- Activación: `cd /home/deploy/ddna-infra && docker compose -f compose.private.yml up -d dashboard`.

La ruta pública es **`http://179.199.132.207/observatorio/`** (la raíz de la IP es
WordPress) y Caddy (`ddna-edge`, servicio `dashboard:3000`, proyecto `ddna-controlled`)
la enruta. Ver `DEPLOY_TOPOLOGY.md`.

### `deploy.sh` está CONGELADO y ROTO (no usarlo)

Roto en 3 formas, ya causó una caída de producción el 2026-10-06:

1. Publica el puerto 80 del host → colisiona con Caddy.
2. `docker-compose.prod.yml` no pasa `NEXT_PUBLIC_BASE_PATH` como build arg →
   compila `basePath: ""` → **todo `/observatorio/*` da 404** (el basePath se
   hornea en BUILD time).
3. Taguea `ddna-dashboard-app:latest`, que el compose activo no usa.

### Deploy commands (HISTÓRICOS — no ejecutar)
```bash
ssh deploy@179.199.132.207
cd /home/deploy/ddna-dashboard
git pull origin main
export $(grep -v '^#' .env.production | xargs)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --remove-orphans
docker image prune -f
```

### Verify (vigente)
```bash
# En la VPS, tras el build del DevOps
cd /home/deploy/ddna-infra && docker compose -f compose.private.yml ps dashboard
curl -I http://179.199.132.207/observatorio/
```

---

## CI/CD

**No hay GitHub Actions instaladas.** `.github/workflows/` no existe en `main` ni en
ninguna rama remota; el workflow de abajo nunca se creó. Lo que disparaba auto-deploys
era la integración nativa de Vercel con GitHub, que el usuario **desconectó el
2026-10-07**. El flujo de deploy actual es el script del DevOps (ver arriba).

El bloque siguiente queda solo como referencia histórica de lo que se había planeado:

### Setup steps (planeado, nunca ejecutado)

1. Generate SSH key → 2. Copy public key to VPS → 3. Add GitHub secrets
(`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`) → 4. Create `.github/workflows/deploy.yml`
with `appleboy/ssh-action@master` running `git pull` + `docker compose up -d --build`
en `/home/deploy/ddna-dashboard`.

---

## Domain + HTTPS (histórico)

El plan original preveía Traefik + Let's Encrypt al configurar `ddna.com.ar`. **Nunca se
usó Traefik**: el edge lo resuelve **Caddy** (`ddna-edge`, `Caddyfile.preview`) y el
tablero se sirve por IP en `/observatorio/` sin HTTPS. HTTPS y dominios son dominio del
DevOps (ver `DEPLOY_TOPOLOGY.md`); no tocarlos.

---

## ETL Scripts

The `scripts/*.mjs` ETL scripts run **outside** Docker, directly on the VPS or in a separate container. They are not part of the web application container.

---

## Rollback Strategy (histórico)

Planeada para el corte Vercel → VPS, ya completado. El procedimiento vigente está en
`DEPLOY_TOPOLOGY.md` y en los reportes del DevOps (`CONTROLLED_ROLLBACK.md`).

---

## Troubleshooting

### Build fails with "Cannot find module '@tailwindcss/postcss'"
Ensure `deps` stage uses `npm ci` (not `npm ci --omit=dev`). DevDependencies are needed during build.

### Port 80 already in use
El puerto 80 lo ocupa a propósito **Caddy** (`ddna-edge`). **No** matar el proceso que
lo usa: hacerlo tumba el portal WordPress y la ruta `/observatorio/`.

### Health check fails
```bash
docker compose logs --tail=50
docker compose exec app env | grep -i supabase
```

### Out of memory during build
Increase swap or build locally:
```bash
docker build -t ddna-dashboard .
docker save ddna-dashboard | gzip > ddna-dashboard.tar.gz
scp ddna-dashboard.tar.gz deploy@179.199.132.207:/home/deploy/
ssh deploy@179.199.132.207 "docker load < /home/deploy/ddna-dashboard.tar.gz"
```

---

## References

- [Next.js Docker deployment](https://nextjs.org/docs/app/api-reference/config/next-config-js/output#standalone)
- [Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Hostinger VPS docs](https://www.hostinger.com/tutorials/vps)
- [GitHub Actions SSH deploy](https://github.com/appleboy/ssh-action)
