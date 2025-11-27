# Fix VPS Docker Backend

## Problem
VPS backend at `srv1015344.hstgr.cloud` is down. CI deploy failed with docker-compose error:
```
KeyError: 'ContainerConfig'
```

## Context
- Frontend agent-chat: **WORKING** (validated on Vercel prod)
- VPS backend: **DOWN** - docker-compose recreate failing
- The `backend-dev` container fails to start

## Task
Restore the VPS backend so `https://srv1015344.hstgr.cloud/api/search` responds.

## Key Files
- `docker-compose.yml` - container config
- `.github/workflows/` - CI deploy scripts

## Success Criteria
```bash
curl -sf "https://srv1015344.hstgr.cloud/api/artists" | head -1
# Should return JSON array
```

## Skill
Invoke `docker-dude` skill for VPS/Docker issues.

## SSH Access
```
root@srv1015344.hstgr.cloud
```
