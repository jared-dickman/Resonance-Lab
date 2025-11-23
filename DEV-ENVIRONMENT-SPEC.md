# Resonance Labs Dev Environment - Product Spec

## Overview
A cloud-based development environment that enables developers to iterate on features entirely in the browser using Claude Code, with automatic preview deployments and zero local setup required.

## Current State

**Architecture:**
- Next.js frontend → Vercel (production + preview deployments)
- Go backend API → Hostinger VPS via Docker Compose
- Supabase (PostgreSQL) → Managed cloud database
- GitHub Actions CI/CD pipeline

**Pain Points:**
- Database dependency issues during local setup
- Inconsistent development environments across team members
- Requires local Docker setup and configuration

## Goals

### Primary
Enable developers to:
1. Discuss features with Claude Code in a cloud IDE
2. Create feature branches automatically
3. View changes live via preview URLs
4. Iterate rapidly without local environment setup
5. Merge to main when satisfied

### Secondary
- Zero local dependencies (no Docker, Node.js version conflicts, etc.)
- Consistent environment across all developers
- Minimal changes to existing CI/CD pipeline

## Proposed Solution

### 1. Cloud IDE Setup (GitHub Codespaces)

**Why Codespaces:**
- Native GitHub integration
- Pre-configured development containers
- Claude Code compatible
- Team consistency (same environment for everyone)

**Configuration:**
- `.devcontainer/devcontainer.json` - Defines container specs, extensions, environment
- Pre-installed: Node.js 20, Go toolchain, necessary VS Code extensions
- Auto-forwarded ports for local development server testing
- Environment variables from GitHub Secrets (Supabase credentials)

**Developer Experience:**
```
1. Navigate to GitHub repo
2. Click "Code" → "Open with Codespaces"
3. Wait ~60s for environment to boot
4. Start coding immediately
```

### 2. Preview Deployment Flow

**Existing (Keep):**
- Vercel automatically deploys frontend on every PR/commit
- Preview URL: `<branch-name>.vercel.app`
- Shared backend-dev instance: `dev.srv1015344.hstgr.cloud/api`

**No Changes Needed:**
- All preview frontends → Shared dev backend
- All previews → Shared dev Supabase database
- Simple, cost-effective, works today

**Workflow:**
```
Developer (in Codespaces):
  ↓ (commits to branch)
GitHub Actions:
  ↓ (runs quality checks)
Vercel:
  ↓ (deploys frontend preview)
Preview URL ready:
  → Frontend: <branch>.vercel.app
  → Backend: dev.srv1015344.hstgr.cloud/api
  → Database: Shared dev Supabase instance
```

### 3. Recommended Workflow

**Feature Development:**
1. Open repo in GitHub Codespaces
2. Discuss feature with Claude Code
3. Claude creates branch: `feature/new-feature-name`
4. Code changes → Auto-commit to branch
5. Push triggers:
   - CI checks (lint, typecheck, build)
   - Vercel preview deployment
6. Review changes at preview URL
7. Iterate: Make changes → Push → Review
8. When satisfied: Create PR → Merge to main

**Production Deployment:**
- Merge to main triggers:
  - Full CI/CD pipeline
  - Vercel production deployment
  - VPS backend deployment (Docker Compose)

### 4. Database Strategy

**Shared Dev Database:**
- All preview environments use same Supabase dev instance
- Simplest approach - no isolation overhead
- Developers can see each other's test data (acceptable for dev)

**Alternative (Future):**
- If data isolation becomes critical, migrate to Supabase branching or schema-per-preview
- Not recommended now - adds complexity and cost

### 5. Resource Management

**Preview Cleanup:**
- Manual cleanup only
- Vercel automatically deactivates old previews after 30 days
- Codespaces auto-sleep after 30min inactivity, deleted after 30 days
- No automated teardown on PR merge/close (keep for reference)

**Cost Considerations:**
- GitHub Codespaces: Free tier → 120 core-hours/month (60 hours of 2-core machine)
- Vercel: Hobby plan likely sufficient (100 GB bandwidth/month)
- Shared backend/DB: No additional preview costs

## Implementation Plan

### Phase 1: Codespaces Setup (Priority: High)
- [ ] Create `.devcontainer/devcontainer.json`
- [ ] Configure Node.js 20 + Go environment
- [ ] Install recommended VS Code extensions
- [ ] Set up GitHub Secrets for environment variables
- [ ] Test full development workflow in Codespaces
- [ ] Document workflow in README

### Phase 2: Developer Documentation (Priority: High)
- [ ] Create step-by-step guide for new developers
- [ ] Document Claude Code workflow
- [ ] Add troubleshooting guide
- [ ] Record demo video (optional)

### Phase 3: CI/CD Refinement (Priority: Medium)
- [ ] Ensure CI passes before Vercel deployment
- [ ] Add preview URL comment bot to PRs
- [ ] Set up deployment status checks

### Phase 4: Optional Enhancements (Priority: Low)
- [ ] Database seeding script for consistent dev data
- [ ] E2E tests against preview environments
- [ ] Storybook deployment alongside previews

## Success Metrics

**Developer Onboarding:**
- Time to first commit: < 5 minutes (vs current ~30+ minutes)
- Setup steps: 2 clicks (vs current ~10+ terminal commands)

**Development Velocity:**
- Feature preview available within 3 minutes of commit
- Zero "works on my machine" issues
- Consistent environment across all developers

**Cost:**
- No additional infrastructure costs (shared backend/DB)
- Codespaces within free tier for small teams

## Technical Specifications

### devcontainer.json Requirements
```json
{
  "name": "Resonance Lab Dev Environment",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:20",
  "features": {
    "ghcr.io/devcontainers/features/go:1": {
      "version": "1.21"
    }
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "bradlc.vscode-tailwindcss"
      ]
    }
  },
  "forwardPorts": [3000, 8081],
  "postCreateCommand": "npm ci",
  "remoteEnv": {
    "NEXT_PUBLIC_API_URL": "https://dev.srv1015344.hstgr.cloud/api"
  }
}
```

### Environment Variables
**GitHub Secrets (Organization/Repo level):**
- `SUPABASE_URL` - Dev Supabase project URL
- `SUPABASE_KEY` - Dev Supabase anon key
- `VERCEL_TOKEN` - Already configured
- `VERCEL_ORG_ID` - Already configured
- `VERCEL_PROJECT_ID` - Already configured

**Codespace Secrets:**
- Auto-sync from repository secrets
- Available as environment variables in container

## Constraints & Assumptions

**Assumptions:**
- Developers have GitHub accounts with Codespaces access
- Small team (< 5 concurrent developers)
- Shared dev resources acceptable (no data isolation required)
- Manual cleanup acceptable (no auto-delete previews)

**Constraints:**
- Keep existing Vercel + Hostinger VPS setup
- No major architectural changes
- Minimal cost increase
- Claude Code compatible

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Shared dev DB conflicts | Low | Document data conventions, future: isolated schemas |
| Codespaces quota exceeded | Medium | Monitor usage, upgrade plan if needed ($4/month for extra hours) |
| Backend-dev downtime | Medium | Monitoring + auto-restart (already configured) |
| Preview environment confusion | Low | Clear naming, PR comments with URLs |

## Future Enhancements

1. **Database Branching:** Supabase preview branches for data isolation
2. **E2E Testing:** Automated Playwright tests against preview URLs
3. **Feature Flags:** LaunchDarkly/similar for progressive rollout
4. **Metrics:** Sentry/DataDog for preview environment monitoring
5. **Storybook:** Component library previews alongside app previews

## Open Questions

- [ ] Should we add automated tests that run against preview deployments?
- [ ] Do we need Storybook deployed alongside previews?
- [ ] Should we set up staging environment separate from dev?

---

**Version:** 1.0
**Last Updated:** 2025-11-23
**Owner:** Jared Dickman
