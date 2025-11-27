#!/bin/bash
# Auto-heal dev server before running BDD tests
# Usage: ./01-auto-heal.sh && pnpm test:bdd

set -e

echo "🔍 Checking dev server health..."

if curl -sf http://localhost:3000 > /dev/null 2>&1; then
  echo "✅ Server healthy"
  exit 0
fi

echo "🔧 Auto-healing..."

# Kill stale process
if lsof -ti:3000 > /dev/null 2>&1; then
  echo "  → Killing process on :3000"
  lsof -ti:3000 | xargs kill -9
  sleep 2
fi

# Clear cache
if [ -d .next ]; then
  echo "  → Clearing .next"
  rm -rf .next
fi

# Start server
echo "  → Starting dev server"
PORT=3000 pnpm dev > /dev/null 2>&1 &

# Wait for ready (max 30s)
TIMEOUT=30
while [ $TIMEOUT -gt 0 ]; do
  if curl -sf http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Server healed"
    exit 0
  fi
  sleep 1
  TIMEOUT=$((TIMEOUT - 1))
done

echo "❌ Auto-heal failed"
exit 1