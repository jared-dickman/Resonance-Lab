#!/bin/bash
# Auto-fix common Docker issues

HOST="root@srv1015344.hstgr.cloud"
ISSUE="$1"

case "$ISSUE" in
  "container-stopped")
    echo "🔧 Starting stopped containers..."
    ssh "$HOST" "cd /root && docker-compose up -d"
    sleep 3
    ssh "$HOST" "docker ps && docker logs resonance-backend --tail=20"
    ;;

  "high-memory")
    echo "🧹 Cleaning up Docker resources..."
    ssh "$HOST" "docker system prune -f"
    echo "🔄 Restarting containers..."
    ssh "$HOST" "docker-compose restart"
    ;;

  "api-unresponsive")
    echo "🔄 Restarting backend..."
    ssh "$HOST" "docker-compose restart backend"
    sleep 5
    echo "🧪 Testing API..."
    ssh "$HOST" "curl -s http://localhost:8080/api/artists | head -5"
    ;;

  "permissions")
    echo "🔐 Fixing permissions..."
    ssh "$HOST" "cd /root/Resonance-Lab && chmod -R 755 songs && docker-compose restart backend"
    ;;

  "disk-full")
    echo "⚠️  WARNING: This will delete unused Docker images and volumes"
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      ssh "$HOST" "docker system prune -af --volumes"
    fi
    ;;

  "nuclear")
    echo "☢️  NUCLEAR OPTION: Full rebuild"
    read -p "This will restart everything. Continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      ssh "$HOST" "cd /root && docker-compose down && docker-compose up -d --build --force-recreate"
      sleep 10
      ssh "$HOST" "docker ps && docker logs resonance-backend --tail=30"
    fi
    ;;

  *)
    echo "Usage: $0 {container-stopped|high-memory|api-unresponsive|permissions|disk-full|nuclear}"
    exit 1
    ;;
esac

echo ""
echo "✅ Fix applied. Run quick-health.sh to verify."