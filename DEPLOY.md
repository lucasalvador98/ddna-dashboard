# Deployment Plan — Docker for Hostinger VPS

> **Status**: ✅ App deployed and running
> **Last updated**: 2026-08-27
> **Goal**: Package the dashboard in Docker for deployment on Hostinger VPS
> **VPS IP**: 179.199.132.207

---

## Context

- **Current stack**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 + Supabase
- **App**: `ddna-dashboard` (Defensoría de Niños, Niñas y Adolescentes de Córdoba)
- **Target**: Hostinger VPS KVM 2 (2 vCPU / 4GB RAM / Ubuntu 24.04)
- **Source**: GitHub repo `lucasalvador98/ddna-dashboard`
- **Database**: Supabase Pro (stays external, no migration)

### Key dependencies affecting deployment
- `next: 16.2.3` — uses `output: 'standalone'` for Docker
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
| `OPENAI_API_KEY` | Yes | Yes | platform.openai.com → API Keys |
| `INTERNAL_API_SECRET` | Yes | Yes | Generated per-deploy (`openssl rand -hex 32`) |
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
| `docker-compose.prod.yml` | Production | Build args for env vars, port 80→3000, restart policy |

### Important Dockerfile fix
The initial build failed because `@tailwindcss/postcss` is a devDependency. The `deps` stage must use `npm ci` (without `--omit=dev`) so the builder stage has all dependencies needed for `next build`.

---

## Deployment

### Current state
- ✅ App running on `http://179.199.132.207`
- ✅ Health check: `curl http://localhost:80/api/health` → `{"status":"healthy"}`
- ⏳ CI/CD via GitHub Actions — pending setup
- ⏳ Domain + HTTPS — pending DNS configuration

### Deploy commands (manual)
```bash
ssh deploy@179.199.132.207
cd /home/deploy/ddna-dashboard
git pull origin main
export $(grep -v '^#' .env.production | xargs)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --remove-orphans
docker image prune -f
```

### Verify
```bash
docker compose ps
curl http://localhost:80/api/health
```

---

## CI/CD — GitHub Actions (Pending)

### Setup steps

1. **Generate SSH key on dev machine:**
```powershell
ssh-keygen -t ed25519 -C "github-actions" -f $env:USERPROFILE\.ssh\github_actions -N '""'
```

2. **Copy public key to VPS:**
```powershell
type $env:USERPROFILE\.ssh\github_actions.pub | ssh deploy@179.199.132.207 "cat >> /home/deploy/.ssh/authorized_keys"
```

3. **Add GitHub secrets** (Settings → Secrets → Actions):

| Secret | Value |
|--------|-------|
| `VPS_HOST` | `179.199.132.207` |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | Full content of `github_actions` private key |

4. **Workflow file:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /home/deploy/ddna-dashboard
            git pull origin main
            export $(grep -v '^#' .env.production | xargs)
            docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --remove-orphans
            docker image prune -f
```

---

## Domain + HTTPS (Pending)

### DNS configuration
- **Domain**: `ddna.com.ar` (registered at NIC Arca)
- **Status**: Waiting for fiscal key (clave fiscal) to configure DNS
- **Records needed**:

| Type | Name | Value |
|------|------|-------|
| A | @ | 179.199.132.207 |
| A | panel | 179.199.132.207 |

### Traefik (planned)
When domain is ready, add Traefik as reverse proxy with automatic Let's Encrypt SSL. See `docker-compose.traefik.yml` template.

---

## ETL Scripts

The `scripts/*.mjs` ETL scripts run **outside** Docker, directly on the VPS or in a separate container. They are not part of the web application container.

---

## Rollback Strategy

1. Vercel deployment stays live until VPS is verified
2. DNS A record → VPS IP only after successful smoke test
3. If VPS fails: revert DNS to Vercel (zero data loss, Supabase unchanged)
4. Container rollback: `git checkout {previous-tag}` + rebuild

---

## Troubleshooting

### Build fails with "Cannot find module '@tailwindcss/postcss'"
Ensure `deps` stage uses `npm ci` (not `npm ci --omit=dev`). DevDependencies are needed during build.

### Port 80 already in use
```bash
sudo lsof -i :80
sudo kill <PID>
```

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
