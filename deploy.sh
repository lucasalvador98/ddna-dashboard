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

echo "⏳ Waiting for healthy status..."
sleep 5
docker compose -f docker-compose.prod.yml ps

echo "🧹 Cleaning old images..."
docker image prune -f

echo "✅ Deploy complete!"
