# Environment Variables Setup Guide

This guide explains where to configure environment variables for different deployment environments to ensure proper separation between development and production.

## 📋 Quick Reference

| Environment | Where to Set Variables | Purpose |
|-------------|------------------------|---------|
| **Local Development** | `.env.local` file | Your local machine |
| **GitHub Codespaces** | `.devcontainer/devcontainer.json` | Cloud dev environment |
| **Vercel Preview** | Vercel Dashboard (Preview) | PR preview deployments |
| **Vercel Production** | Vercel Dashboard (Production) | Production frontend |
| **VPS Backend** | `docker-compose.yml` | Production/Dev backend |
| **GitHub Actions** | Repository Secrets | CI/CD pipelines |

---

## 🔧 Environment-Specific Setup

### 1️⃣ Local Development

**File:** `frontend/.env.local` (create this file, not tracked in git)

```bash
# Local development - backend runs on localhost
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_TELEMETRY_DISABLED=1

# Future: Add Supabase dev credentials when needed
# SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
# SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Steps:**
1. Copy `.env.example` to `frontend/.env.local`
2. Update values for your local setup
3. Start backend: `cd scraper && go run cmd/server/main.go`
4. Start frontend: `cd frontend && npm run dev`

---

### 2️⃣ GitHub Codespaces

**File:** `.devcontainer/devcontainer.json` (already configured)

```json
"remoteEnv": {
  "NEXT_PUBLIC_API_BASE_URL": "https://dev.srv1015344.hstgr.cloud/api",
  "NEXT_TELEMETRY_DISABLED": "1"
}
```

**For Secrets (Supabase credentials):**

1. Go to **Repository Settings** → **Secrets and variables** → **Codespaces**
2. Click **New repository secret**
3. Add:
   - `SUPABASE_URL` → Your dev Supabase project URL
   - `SUPABASE_ANON_KEY` → Your dev Supabase anon key

These secrets are automatically available as environment variables in all Codespaces.

**Why this works:** Codespaces use the shared dev backend, so all preview environments can share the same API and database.

---

### 3️⃣ Vercel Deployments

#### Environment Variables Dashboard

Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

#### Preview Deployments (PR previews)

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://dev.srv1015344.hstgr.cloud/api` | Preview |
| `NEXT_TELEMETRY_DISABLED` | `1` | All |

#### Production Deployment

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://srv1015344.hstgr.cloud/api` | Production |
| `NEXT_TELEMETRY_DISABLED` | `1` | All |

**Steps:**
1. Click **Add New** → **Environment Variable**
2. Enter variable name (e.g., `NEXT_PUBLIC_API_BASE_URL`)
3. Enter value
4. Select environment:
   - ✅ **Production** - Only production deployments
   - ✅ **Preview** - PR preview deployments
   - ⬜ **Development** - Not needed for Vercel
5. Click **Save**

**Important:**
- Preview deployments point to `dev.srv1015344.hstgr.cloud/api` (dev backend)
- Production deployments point to `srv1015344.hstgr.cloud/api` (prod backend)
- This ensures preview environments don't touch production data

---

### 4️⃣ VPS Backend (Docker Compose)

**File:** `docker-compose.yml` (already configured)

#### Production Backend
```yaml
backend:
  environment:
    - SONGS_DIR=/app/songs
    - ADDR=:8080
    - SONGIFY_SCRIPT=/app/frontend/scripts/songify.ts
```

#### Development Backend
```yaml
backend-dev:
  environment:
    - SONGS_DIR=/app/songs
    - ADDR=:8081
    - SONGIFY_SCRIPT=/app/frontend/scripts/songify.ts
```

**Deployment:**
```bash
# SSH into VPS
ssh root@srv1015344.hstgr.cloud

# Pull latest code
cd /root/Resonance-Lab
git pull origin master

# Rebuild and restart
docker-compose up -d --build backend backend-dev
```

---

### 5️⃣ GitHub Actions (CI/CD)

**File:** `.github/workflows/ci-cd-complete.yml`

**For Public Variables:**
Add directly in workflow file:
```yaml
env:
  NEXT_TELEMETRY_DISABLED: 1
```

**For Secrets:**
1. Go to **Repository Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add secrets like:
   - `VPS_SSH_KEY` (already configured)
   - `VERCEL_TOKEN` (already configured)
   - Future: `SUPABASE_URL`, `SUPABASE_ANON_KEY` if needed for CI tests

**Access in workflow:**
```yaml
- name: Build frontend
  run: npm run build
  env:
    NEXT_TELEMETRY_DISABLED: 1
    # Future: Add Supabase vars if needed for build
    # SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
```

---

## 🔐 Security Best Practices

### ✅ DO

- **Use `NEXT_PUBLIC_` prefix** for client-side variables (exposed to browser)
- **Store secrets in platform secret managers** (GitHub Secrets, Vercel Environment Variables)
- **Use different credentials** for dev/preview vs production
- **Keep `.env.local` in `.gitignore`** (never commit secrets)
- **Use `.env.example` to document** required variables without exposing values

### ❌ DON'T

- **Don't commit `.env` files** with real credentials
- **Don't use production credentials** in development/preview environments
- **Don't put secrets in `NEXT_PUBLIC_*` variables** (exposed to browser)
- **Don't hardcode secrets** in source code

---

## 🗂️ File Hierarchy

```
.env.example           # Template (committed to git, no secrets)
frontend/.env.local    # Local dev (gitignored, your secrets)
frontend/.env          # Not used (gitignored)
```

**.gitignore already includes:**
```
.env
.env.local
.env.*.local
```

---

## 🚀 Environment Flow

### Development Flow
```
Developer → Codespace
  ↓ (uses)
.devcontainer/devcontainer.json remoteEnv
  ↓ (points to)
dev.srv1015344.hstgr.cloud/api (backend-dev)
  ↓ (connects to)
Shared dev Supabase (future)
```

### Preview Flow
```
Developer → Push to PR
  ↓ (triggers)
GitHub Actions CI
  ↓ (deploys to)
Vercel Preview (branch-name.vercel.app)
  ↓ (uses env vars from)
Vercel Dashboard → Preview Environment
  ↓ (points to)
dev.srv1015344.hstgr.cloud/api (backend-dev)
  ↓ (connects to)
Shared dev Supabase (future)
```

### Production Flow
```
Developer → Merge to main
  ↓ (triggers)
GitHub Actions CI
  ↓ (deploys to)
Vercel Production (resonance-lab.vercel.app)
  ↓ (uses env vars from)
Vercel Dashboard → Production Environment
  ↓ (points to)
srv1015344.hstgr.cloud/api (backend)
  ↓ (connects to)
Production Supabase (future)
```

---

## 🧪 Testing Your Setup

### Local Development
```bash
# Start backend
cd scraper
go run cmd/server/main.go
# Should see: Starting server on :8080

# Start frontend (in another terminal)
cd frontend
npm run dev
# Should see: Local: http://localhost:3000

# Check API connection
curl http://localhost:8080/api/health
```

### Codespaces
```bash
# In Codespace terminal
echo $NEXT_PUBLIC_API_BASE_URL
# Should print: https://dev.srv1015344.hstgr.cloud/api

# Start frontend
cd frontend
npm run dev
# Open forwarded port 3000 in browser
```

### Vercel
1. Push code to a PR branch
2. Wait for Vercel deployment
3. Click preview URL in PR comment
4. Open browser DevTools → Network tab
5. Should see API calls to `dev.srv1015344.hstgr.cloud/api`

---

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [GitHub Codespaces Secrets](https://docs.github.com/en/codespaces/managing-your-codespaces/managing-secrets-for-your-codespaces)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

## 🆘 Troubleshooting

### "API calls failing in Codespaces"
- Check: `echo $NEXT_PUBLIC_API_BASE_URL` in terminal
- Should be: `https://dev.srv1015344.hstgr.cloud/api`
- If wrong: Rebuild container (Cmd/Ctrl+Shift+P → "Rebuild Container")

### "API calls failing in Vercel preview"
- Check: Vercel Dashboard → Project → Settings → Environment Variables
- Verify `NEXT_PUBLIC_API_BASE_URL` is set for **Preview** environment
- Redeploy the preview after adding/changing variables

### "Wrong backend in production"
- Check: Vercel Dashboard → Environment Variables
- Verify `NEXT_PUBLIC_API_BASE_URL` for **Production** is `https://srv1015344.hstgr.cloud/api`
- NOT `dev.srv1015344.hstgr.cloud/api`

### "Environment variables not updating"
- **Next.js:** Restart dev server after changing `.env.local`
- **Vercel:** Redeploy after changing environment variables
- **Codespaces:** Rebuild container after changing `devcontainer.json`
- **Docker:** Restart containers after changing `docker-compose.yml`

---

**Last Updated:** 2025-11-23
**Maintained By:** Resonance Lab Team
