---
name: github-actions-maintainer
description: Validates GitHub Actions against official docs, prevents version drift, ensures best practices
auto_trigger: true
keywords: [github actions, workflow, ci, version drift, .github/workflows]
---

# GitHub Actions Maintainer

Keeps CI/CD infrastructure current with official GitHub Actions best practices.

## Auto-Invoke

Modified `.github/workflows/*.yml` or keywords: "update workflow", "github actions", "ci version"

## Goals

**Prevent version drift** between workflows and package.json
**Validate against official docs** for each action used
**Identify optimization opportunities** (caching, SARIF, parallelization)
**Ensure security best practices** (permissions, pinning strategy)

## Validation Points

**Action versions:**
- Compare `uses:` versions against latest stable releases
- Verify pinning strategy (major tags like `v4`, not SHA or `main`)

**Tool versions:**
- Hardcoded package versions must match package.json
- Node.js versions must match `.nvmrc` or package.json engines
- pnpm version should use `packageManager` field

**Missing optimizations:**
- Dependency caching for faster runs
- SARIF uploads for security scanning tools
- Artifact retention policies

**Security:**
- Minimal permissions (read-only default)
- No secrets in logs
- Trusted action sources only

## Report Format

**Per workflow:**
- Outdated actions (current → latest)
- Version mismatches (CI vs package.json)
- Missing optimizations
- Security concerns

**Priority:**
- CRITICAL: Breaking or security issues
- HIGH: Major version behind
- MEDIUM: Optimization opportunities

## Auto-Fix Criteria

**Automatic:**
- Patch/minor bumps within same major version
- Adding performance optimizations (caching)
- Adding SARIF uploads (non-breaking)

**Approval required:**
- Major version updates
- Permission scope changes
- Workflow trigger modifications

## References

- GitHub Actions official docs
- Project security baseline in `llm/rules/security.md`
- Existing SARIF patterns in snyk-security.yml, codeql.yml