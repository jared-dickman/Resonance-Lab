# Codespaces Setup Guide

This guide explains how to set up and use GitHub Codespaces for Resonance Lab development.

## Prerequisites

- GitHub account with Codespaces access
- Repository access to Resonance-Lab

## Required GitHub Secrets

The following secrets must be configured at the repository or organization level for Codespaces to work properly:

### Development Environment Secrets

1. **SUPABASE_URL** - Your Supabase development project URL
   - Example: `https://xxxxxxxxxxxxx.supabase.co`
   - Get from: Supabase Dashboard → Project Settings → API

2. **SUPABASE_KEY** - Your Supabase anon/public key
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Get from: Supabase Dashboard → Project Settings → API → `anon` `public` key

### How to Add Secrets to Codespaces

#### Option 1: Repository Secrets (Recommended)
1. Go to repository **Settings** → **Secrets and variables** → **Codespaces**
2. Click **New repository secret**
3. Add each secret name and value
4. These secrets will be automatically available in all Codespaces

#### Option 2: User Secrets (Personal)
1. Go to your GitHub **Settings** → **Codespaces** → **Secrets**
2. Click **New secret**
3. Add secret and select which repositories can access it
4. Useful for personal development credentials

## Quick Start

### 1. Launch Codespace

**Option A: From GitHub UI**
1. Navigate to the Resonance-Lab repository
2. Click the green **Code** button
3. Select **Codespaces** tab
4. Click **Create codespace on [branch]**
5. Wait ~60-90 seconds for environment to build

**Option B: From VS Code Desktop**
1. Install "GitHub Codespaces" extension
2. Press `Cmd/Ctrl + Shift + P`
3. Type "Codespaces: Create New Codespace"
4. Select repository and branch

### 2. Verify Environment

Once the Codespace loads, verify the setup:

```bash
# Check Node.js version (should be 20.x)
node -v

# Check Go version (should be 1.21.x)
go version

# Check npm dependencies are installed
ls -la node_modules
ls -la frontend/node_modules
```

### 3. Start Development Server

```bash
# Navigate to frontend directory
cd frontend

# Start Next.js dev server
npm run dev
```

The dev server will start on port 3000, which is automatically forwarded. Click the notification or check the **PORTS** tab to open the preview URL.

### 4. Development Workflow

1. **Make changes** in the Codespace editor
2. **Test locally** using the forwarded port (3000)
3. **Commit changes** using the Source Control panel
4. **Push to branch** to trigger Vercel preview deployment
5. **Review preview** at `<branch-name>.vercel.app`

## Environment Details

### Pre-installed Tools

- **Node.js 20** - For Next.js frontend development
- **Go 1.21** - For backend API development
- **Docker-in-Docker** - For running Docker Compose locally if needed
- **Git** - Version control

### VS Code Extensions

The following extensions are pre-installed:
- ESLint - JavaScript/TypeScript linting
- Prettier - Code formatting
- Tailwind CSS IntelliSense - Tailwind class completion
- Go - Go language support
- Docker - Docker management
- GitLens - Enhanced Git features
- Error Lens - Inline error display
- Code Spell Checker - Spell checking

### Port Forwarding

These ports are automatically forwarded:
- **3000** - Next.js frontend dev server
- **8080** - Backend API (production)
- **8081** - Backend API (development)

### Environment Variables

The following environment variables are automatically set:

```bash
NEXT_PUBLIC_API_URL=https://dev.srv1015344.hstgr.cloud/api
NEXT_TELEMETRY_DISABLED=1
# Plus any secrets configured in GitHub Secrets
```

## Working with the Backend

### Running Backend Locally (Optional)

If you need to test backend changes locally:

```bash
# Navigate to scraper directory
cd scraper

# Build the Go binary
go build -o main .

# Run the server
ADDR=:8081 SONGS_DIR=../songs ./main
```

### Using Shared Dev Backend (Recommended)

For most development, use the shared dev backend:
- URL: `https://dev.srv1015344.hstgr.cloud/api`
- Already configured in `NEXT_PUBLIC_API_URL`
- No local backend needed

## Troubleshooting

### Codespace won't start
- Check your GitHub Codespaces quota (120 core-hours/month free)
- Try creating a new Codespace
- Check GitHub Status page

### Dependencies not installed
```bash
# Reinstall root dependencies
npm ci

# Reinstall frontend dependencies
cd frontend && npm ci
```

### Environment variables missing
1. Verify secrets are set in GitHub Settings → Codespaces
2. Rebuild the Codespace: `Cmd/Ctrl + Shift + P` → "Codespaces: Rebuild Container"

### Port forwarding not working
1. Check **PORTS** tab in VS Code
2. Right-click port → "Port Visibility" → "Public"
3. Restart the dev server

### Dev server fails to start
```bash
# Check Node version
node -v  # Should be 20.x

# Clear Next.js cache
cd frontend
rm -rf .next
npm run dev
```

## Resource Management

### Auto-Sleep
Codespaces automatically sleep after **30 minutes** of inactivity to save resources.

### Manual Stop
Stop your Codespace when not in use:
1. Go to https://github.com/codespaces
2. Click ⋯ menu → **Stop codespace**

### Delete Unused Codespaces
Delete Codespaces you no longer need:
1. Go to https://github.com/codespaces
2. Click ⋯ menu → **Delete**

## Cost Management

### Free Tier
- 120 core-hours/month free
- 2-core machine = 60 hours/month
- 4-core machine = 30 hours/month

### Tips to Stay in Free Tier
1. Use 2-core machine (default)
2. Stop Codespaces when not in use
3. Delete old/unused Codespaces
4. Set auto-delete timeout: Settings → Codespaces → Default retention period

## Next Steps

- See [DEV-ENVIRONMENT-SPEC.md](../DEV-ENVIRONMENT-SPEC.md) for full architecture details
- See main [README.md](../README.md) for project overview
- Join team chat for support

## Support

If you encounter issues:
1. Check this troubleshooting guide
2. Search GitHub Issues
3. Ask in team chat
4. Create a new GitHub Issue with `[codespaces]` tag
