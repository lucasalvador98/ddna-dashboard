#!/usr/bin/env bash
set -euo pipefail

# etl.sh — Run ETL jobs on VPS
# Usage: ./etl.sh [all|indec|senaf]
# Cron: 0 3 1 * * /home/deploy/ddna-dashboard/etl.sh all >> /home/deploy/ddna-dashboard/etl.log 2>&1

CATEGORY="${1:-all}"
LOG_PREFIX="[ETL $(date -u +%Y-%m-%dT%H:%M:%SZ)]"

echo "$LOG_PREFIX Starting ETL — category: $CATEGORY"

# Load env
set -a
source .env.production
set +a

# Run ETL inside the app container (which has node + scripts)
run_in_container() {
  local script="$1"
  echo "$LOG_PREFIX Running $script..."
  docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T app node "scripts/$script"
  echo "$LOG_PREFIX $script done"
}

case "$CATEGORY" in
  all)
    run_in_container "update-indec-indicators.mjs"
    run_in_container "load-senaf-data.mjs"
    ;;
  indec)
    run_in_container "update-indec-indicators.mjs"
    ;;
  senaf)
    run_in_container "load-senaf-data.mjs"
    ;;
  *)
    echo "Usage: $0 [all|indec|senaf]"
    exit 1
    ;;
esac

echo "$LOG_PREFIX ETL complete"
