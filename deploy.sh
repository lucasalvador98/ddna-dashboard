#!/bin/bash
set -e

echo "📦 Deploying ddna-dashboard..."

cd /home/deploy/ddna-dashboard

echo "⬇️  Pulling latest code..."
git stash --quiet 2>/dev/null || true
git pull origin main

echo "🔗 Linking .env.production → .env for build args..."
ln -sf .env.production .env

echo "🔨 Building container..."
docker compose -f docker-compose.prod.yml build --no-cache

echo "🚀 Restarting..."
docker compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for container to be healthy..."
sleep 10

# ── PostgREST warmup ──────────────────────────────────────────────────────────
# After a cold start PostgREST needs a few seconds to load its schema cache.
# Ping it in a loop so the first real user request doesn't get a 500.
echo "🔥 Warming up PostgREST..."
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.production | cut -d= -f2 | tr -d '"' | tr -d "'")
SUPABASE_ANON=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.production | cut -d= -f2 | tr -d '"' | tr -d "'")

if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_ANON" ]; then
  for i in 1 2 3 4 5; do
    # Probe a real table row, not the PostgREST root: the root endpoint requires
    # schema introspection and returns 403 for the anon role even when healthy,
    # which used to make every deploy print a false "not ready" warning.
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
      -H "apikey: $SUPABASE_ANON" \
      -H "Authorization: Bearer $SUPABASE_ANON" \
      "$SUPABASE_URL/rest/v1/indicadores?select=id&limit=1" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ]; then
      echo "   ✅ PostgREST ready (attempt $i)"
      break
    fi
    echo "   ⏳ Attempt $i — PostgREST not ready (HTTP $HTTP_CODE), waiting 3s..."
    sleep 3
  done
else
  echo "   ⚠️  Could not read Supabase env vars, skipping warmup"
fi

echo "🧹 Cleaning old images..."
docker image prune -f

echo "✅ Deploy complete!"
