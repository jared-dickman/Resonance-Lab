---
name: github-actions-workflow
description: Auto-invoked for CI/CD workflow issues. Creates, debugs, and maintains GitHub Actions following reusable workflow patterns.
auto_trigger: true
keywords: [github actions, workflow, ci/cd, deploy, pipeline, yaml, reusable, ci-cd-dev, ci-cd-prod]
---

# GitHub Actions Workflow

**Mode**: CI/CD Pipeline Expert - Creates and maintains GitHub Actions using reusable workflow architecture

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT (any branch)                      │
│  ci-cd-dev.yml                                                   │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐ │
│  │   quality    │──▶│  build-test  │──▶│  deploy-dev          │ │
│  │   -security  │   │              │   │  (backend-dev)       │ │
│  └──────────────┘   └──────────────┘   └──────────────────────┘ │
│                                         dev.srv1015344.hstgr.cloud│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION (main/master only)                 │
│  ci-cd-prod.yml                                                  │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐ │
│  │   quality    │──▶│  build-test  │──▶│  deploy-backend      │ │
│  │   -security  │   │  + security  │   │  (backend)           │ │
│  └──────────────┘   └──────────────┘   └──────────────────────┘ │
│                                         srv1015344.hstgr.cloud   │
└─────────────────────────────────────────────────────────────────┘
```

## Reusable Workflows

**Location**: `.github/workflows/reusable-*.yml`

| Workflow | Purpose | Inputs |
|----------|---------|--------|
| `reusable-quality-security.yml` | Linting, type-check, format | `enable_sonarcloud` |
| `reusable-build-test.yml` | Build + test | `upload_coverage` |
| `reusable-security-audit.yml` | Security scanning | - |
| `reusable-deploy-backend.yml` | SSH deploy to VPS | `environment`, `branch`, `container_name`, `health_check_url` |

## Key Patterns

**Branch references for PRs:**
```yaml
# CORRECT - works for both push and PR events
branch: ${{ github.head_ref || github.ref_name }}

# WRONG - returns "16/merge" for PRs
branch: ${{ github.ref_name }}
```

**Trigger configuration:**
```yaml
# Dev: All branches except main/master
on:
  push:
    branches-ignore: [main, master]
  pull_request:
    types: [opened, synchronize, reopened]

# Prod: Only main/master
on:
  push:
    branches: [main, master]
```

**Secrets inheritance:**
```yaml
jobs:
  deploy:
    uses: ./.github/workflows/reusable-deploy-backend.yml
    secrets: inherit  # Pass all repo secrets to reusable workflow
```

## Workflow Debugging

**Check run status:**
```bash
gh run list --limit 5
gh run view <run-id>
gh run watch <run-id>
```

**Common failures:**

- **SSH auth failed** → Verify `VPS_SSH_KEY` secret matches `~/.ssh/id_ed25519`
- **Wrong branch deployed** → Use `github.head_ref || github.ref_name`
- **Health check failed** → Container startup delay, increase sleep time
- **Quality gate failed** → Run `pnpm check:all` locally first

## Creating New Workflows

**Reusable workflow template:**
```yaml
name: Reusable Workflow Name

on:
  workflow_call:
    inputs:
      input_name:
        description: 'What it does'
        type: string
        required: true
    secrets:
      SECRET_NAME:
        required: true

jobs:
  job-name:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Step
        run: echo "${{ inputs.input_name }}"
```

**Caller workflow template:**
```yaml
jobs:
  call-reusable:
    uses: ./.github/workflows/reusable-workflow.yml
    with:
      input_name: value
    secrets: inherit
```

## Anti-Patterns

❌ **Bad:** Hardcoded branch names for PR deployments
✅ **Good:** `${{ github.head_ref || github.ref_name }}`

❌ **Bad:** Duplicating workflow logic across files
✅ **Good:** Extract to `reusable-*.yml` with inputs

❌ **Bad:** Storing secrets in workflow files
✅ **Good:** Use `secrets: inherit` or explicit `secrets.NAME`

❌ **Bad:** No health check after deployment
✅ **Good:** Always verify deployment with curl health check

## Official Documentation

**ALWAYS consult via Jina before guessing:**

- https://docs.github.com/en/actions/using-workflows/reusing-workflows
- https://docs.github.com/en/actions/learn-github-actions/contexts
- https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions
- https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions
- https://github.com/appleboy/ssh-action (VPS deployment)

**Use `mcp__jina__read_url` to verify syntax before suggesting changes.**

## Quick Reference

**GitHub context variables:**
- `github.ref_name` - Branch name (or merge ref for PRs)
- `github.head_ref` - PR source branch (empty for push)
- `github.base_ref` - PR target branch
- `github.event_name` - "push" or "pull_request"
- `github.sha` - Commit SHA

**Job dependencies:**
```yaml
jobs:
  first: ...
  second:
    needs: first  # Runs after first completes
  third:
    needs: [first, second]  # Runs after both complete
```
