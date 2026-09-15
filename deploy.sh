#!/usr/bin/env bash
set -euo pipefail

# deploy.sh — Manual deploy to VPS
# Usage: ssh deploy@179.199.132.207 'cd /home/deploy/ddna-dashboard && ./deploy.sh'

echo "=== ddna-dashboard deploy $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="

# 1. Pull latest code
echo "[1/5] git pull origin main..."
git pull origin main

# 2. Load env vars
echo "[2/5] Loading .env.production..."
set -a
source .env.production
set +a

# 3. Build and restart containers
echo "[3/5] docker compose build + up..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --remove-orphans

# 4. Cleanup
echo "[4/5] Pruning unused images..."
docker image prune -f

# 5. Health check
echo "[5/5] Health check..."
sleep 10
if curl -sf http://localhost:80/api/health > /dev/null 2>&1; then
  echo "✅ Deploy OK — health check passed"
else
  echo "❌ Health check FAILED — showing last 50 lines of logs:"
  docker compose logs --tail=50
  exit 1
fi

# 6. Setup ETL cron (idempotent — only adds if not present)
ETL_CRON="0 3 1 * * /home/deploy/ddna-dashboard/etl.sh all >> /home/deploy/ddna-dashboard/etl.log 2>&1"
if ! crontab -l 2>/dev/null | grep -qF "etl.sh"; then
  echo "[6/6] Installing ETL cron job..."
  (crontab -l 2>/dev/null; echo "$ETL_CRON") | crontab -
  echo "  → ETL cron installed: monthly at 03:00 UTC"
else
  echo "[6/6] ETL cron already installed"
fi
