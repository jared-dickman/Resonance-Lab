#!/bin/bash
# Quick VPS health check - runs in < 10 seconds

HOST="root@srv1015344.hstgr.cloud"

echo "🔍 Docker Dude - Quick Health Check"
echo "===================================="

ssh -o ConnectTimeout=5 "$HOST" '
  echo "📦 Container Status:"
  docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "resonance|traefik|n8n" || echo "❌ No containers running"

  echo ""
  echo "💾 Resource Usage:"
  docker stats --no-stream --format "{{.Name}}: CPU={{.CPUPerc}} MEM={{.MemPerc}}" | grep -E "resonance|traefik"

  echo ""
  echo "🌐 API Health:"
  if curl -sf http://localhost:8080/api/artists > /dev/null 2>&1; then
    echo "✅ API responding"
    curl -s http://localhost:8080/api/artists | head -3
  else
    echo "❌ API not responding"
  fi

  echo ""
  echo "💿 Disk Space:"
  df -h / | tail -1 | awk "{print \"Used: \" \$5 \" (\" \$3 \" / \" \$2 \")\"}"

  echo ""
  echo "📋 Recent Errors:"
  docker logs resonance-backend --tail=50 2>&1 | grep -i "error\|fatal\|panic" | tail -5 || echo "✅ No recent errors"
'

echo ""
echo "===================================="
echo "Health check complete!"