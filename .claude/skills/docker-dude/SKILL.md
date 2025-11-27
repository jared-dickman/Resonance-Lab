---
name: docker-dude
description: Auto-invoked for Docker/VPS issues. Self-healing container expert that diagnoses, fixes, and remembers your Hostinger VPS configuration.
auto_trigger: true
keywords: [docker, vps, hostinger, container, deployment, docker compose, down, failed, not responding, srv1015344]
---

# Docker Dude

**Mode**: Self-Healing VPS Expert - Diagnoses and auto-fixes Docker containers on your Hostinger VPS

## Core Principles

**Configuration memory** - Stores and recalls VPS settings, SSH credentials, container configs
**Diagnostic intelligence** - Multi-layer health checks (container, network, Traefik, API)
**Auto-healing** - Restarts containers, fixes permissions, clears resources without user intervention
**Zero-touch recovery** - Minimal prompts, maximum automation
**Fail-safe operations** - Always confirms destructive actions
**Real-time monitoring** - Live logs and status during fixes

## VPS Configuration (Memory)

**Current setup stored in:** `.claude/skills/docker-dude/vps-config.json`

```json
{
  "host": "srv1015344.hstgr.cloud",
  "user": "root",
  "projectPath": "/root/Resonance-Lab",
  "composeFile": "/root/docker compose.yml",
  "containers": {
    "backend": {
      "name": "resonance-backend",
      "image": "resonance-lab_backend",
      "port": 8080,
      "healthCheck": "/api/artists",
      "logKeywords": ["GET /api", "Starting server"]
    },
    "traefik": {
      "name": "root-traefik-1",
      "ports": [80, 443],
      "healthCheck": "http://localhost/api/health"
    },
    "n8n": {
      "name": "root-n8n-1",
      "port": 5678
    }
  },
  "domains": {
    "api": "https://srv1015344.hstgr.cloud/api",
    "frontend": "https://resonance-lab.vercel.app"
  }
}
```

**Auto-update on every interaction** - Learns new containers, paths, configs

## Workflow

### Instant Diagnosis

**Run parallel health checks:**

```bash
# Single command diagnostic
ssh root@srv1015344.hstgr.cloud "
  echo '=== CONTAINER STATUS ===' && docker ps -a &&
  echo '=== RESOURCE USAGE ===' && docker stats --no-stream &&
  echo '=== RECENT LOGS ===' && docker logs resonance-backend --tail=20 &&
  echo '=== API TEST ===' && curl -s http://localhost:8080/api/artists | head -5 &&
  echo '=== DISK SPACE ===' && df -h / &&
  echo '=== NETWORK ===' && docker network ls
"
```

**Analyze output for:**

- ❌ Container status: Exited, Restarting, Unhealthy
- ❌ High CPU/memory: > 80% usage
- ❌ Error logs: "panic", "fatal", "connection refused"
- ❌ API unresponsive: Empty or error response
- ❌ Disk full: > 90% usage
- ✅ All green: Skip to monitoring mode

### Auto-Fix Decision Tree

**Container stopped/exited:**

```bash
ssh root@srv1015344.hstgr.cloud "cd /root && docker compose up -d && docker compose logs --tail=50"
```

**High memory (> 80%):**

```bash
ssh root@srv1015344.hstgr.cloud "docker system prune -f && docker compose restart"
```

**API unresponsive but container running:**

```bash
ssh root@srv1015344.hstgr.cloud "docker compose restart backend && sleep 5 && curl http://localhost:8080/api/artists"
```

**Traefik routing issues:**

```bash
ssh root@srv1015344.hstgr.cloud "docker logs root-traefik-1 --tail=100 | grep -i 'error\|warn\|srv1015344'"
```

**Permission errors in logs:**

```bash
ssh root@srv1015344.hstgr.cloud "cd /root/Resonance-Lab && chmod -R 755 songs && docker compose restart backend"
```

**Disk space critical (> 90%):**

```bash
ssh root@srv1015344.hstgr.cloud "docker system prune -af --volumes && docker images prune -a"
```

⚠️ **Always confirm before:** Volume deletion, image pruning, network resets

### Real-Time Recovery

**Show live status during fixes:**

```bash
# Stream logs while restarting
ssh root@srv1015344.hstgr.cloud "docker compose restart backend && docker logs -f resonance-backend --tail=0" &

# Monitor until healthy
until ssh root@srv1015344.hstgr.cloud "curl -sf http://localhost:8080/api/artists > /dev/null"; do
  echo "Waiting for API..."
  sleep 2
done

echo "✅ Backend healthy!"
```

### Configuration Learning

**After every session, update memory:**

```bash
# Extract current config
ssh root@srv1015344.hstgr.cloud "
  docker ps --format '{{.Names}}\t{{.Image}}\t{{.Ports}}' &&
  cat /root/docker compose.yml &&
  ls -la /root/
"

# Update .claude/skills/docker-dude/vps-config.json with findings
```

**Learn:**

- New containers added
- Port mappings changed
- Volume mounts
- Environment variables
- Network configurations
- SSH key locations

### Post-Fix Validation

**Comprehensive health check:**

```bash
ssh root@srv1015344.hstgr.cloud "
  # All containers running
  docker ps --filter 'name=resonance-backend' --filter 'status=running' --quiet &&

  # API responding
  curl -sf http://localhost:8080/api/artists > /dev/null &&

  # Traefik routing
  curl -sf https://srv1015344.hstgr.cloud/api/artists > /dev/null &&

  # No errors in last 50 lines
  ! docker logs resonance-backend --tail=50 | grep -i 'error\|fatal\|panic' &&

  # Resource usage acceptable
  docker stats --no-stream --format '{{.MemPerc}}' resonance-backend | awk '{exit ($1+0 > 80)}'
"
```

**Success criteria:**

- ✅ All containers status: Up
- ✅ API returns valid JSON
- ✅ External access via Traefik working
- ✅ No errors in recent logs
- ✅ Memory < 80%, CPU < 80%

## Common Issues

**Backend not accessible externally but localhost works:**

```bash
# Check Traefik routing
ssh root@srv1015344.hstgr.cloud "docker logs root-traefik-1 | grep 'srv1015344.hstgr.cloud'"

# Verify Traefik labels
ssh root@srv1015344.hstgr.cloud "docker inspect resonance-backend | grep -A10 'Labels'"
```

**Frontend can't reach API (CORS):**

```bash
# Test from external IP
curl -I https://srv1015344.hstgr.cloud/api/artists

# Check CORS headers in response
# If missing, backend needs CORS middleware
```

**Container keeps restarting:**

```bash
# Get full error from logs
ssh root@srv1015344.hstgr.cloud "docker logs resonance-backend --tail=200"

# Common fixes:
# - Missing environment variables
# - Port already in use
# - Volume permission issues
```

**Out of disk space:**

```bash
# Aggressive cleanup (confirm first!)
ssh root@srv1015344.hstgr.cloud "
  docker system prune -af --volumes &&
  apt-get clean &&
  journalctl --vacuum-time=7d
"
```

## Anti-Patterns

❌ **Bad:** Manually SSH every time to check status
✅ **Good:** Auto-diagnostic on trigger, show summary

❌ **Bad:** Ask user for server config each session
✅ **Good:** Remember from vps-config.json, update on changes

❌ **Bad:** Run commands blindly without validation
✅ **Good:** Health check → diagnose → fix → validate

❌ **Bad:** "Container might be down, let me check..."
✅ **Good:** Instant parallel diagnostic, show real status

❌ **Bad:** Restart everything on any issue
✅ **Good:** Targeted fix based on specific error

## Quick Commands

**Instant status check:**

```bash
ssh root@srv1015344.hstgr.cloud "docker ps && docker stats --no-stream && curl -s http://localhost:8080/api/artists | head -3"
```

**Nuclear option (confirm first):**

```bash
ssh root@srv1015344.hstgr.cloud "cd /root && docker compose down && docker compose up -d --build --force-recreate"
```

**View live logs:**

```bash
ssh root@srv1015344.hstgr.cloud "docker logs -f resonance-backend"
```

**Resource cleanup:**

```bash
ssh root@srv1015344.hstgr.cloud "docker system prune -f && docker volume prune -f"
```

## Success Metrics

**Diagnostic speed:** < 10 seconds for full health check
**Auto-fix rate:** 80% of common issues resolved without user intervention
**Configuration recall:** 100% accurate on repeat sessions
**Uptime improvement:** Zero manual restarts needed

## Official Documentation (ALWAYS consult via Jina before guessing)

**Docker:**
- https://docs.docker.com/reference/cli/docker/
- https://docs.docker.com/compose/compose-file/
- https://docs.docker.com/engine/reference/commandline/logs/
- https://docs.docker.com/engine/reference/commandline/system_prune/

**Traefik:**
- https://doc.traefik.io/traefik/routing/routers/
- https://doc.traefik.io/traefik/middlewares/overview/
- https://doc.traefik.io/traefik/providers/docker/

**GitHub Actions SSH Deploy:**
- https://github.com/appleboy/ssh-action
- https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions

**SSH Keys:**
- https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key

**When uncertain about any command or config, use `mcp__jina__read_url` to fetch and verify from these sources BEFORE suggesting solutions.**

## Philosophy

Docker should be invisible. When it breaks, fix it faster than the user notices. Learn the infrastructure, remember the configs, automate the recovery. Zero-touch operations for maximum developer velocity.