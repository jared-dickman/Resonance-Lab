# Package Management

## Core Pattern
pnpm only. Exact versions only. Always ask permission before installing.

## Installation Process
**Required steps:**
1. Ask user permission
2. Check latest: `npm view package-name version`
3. Install exact: `pnpm add package-name@1.2.3`
4. Confirm: `pnpm list package-name`

```bash
npm view react-hook-form version  # Check: 7.45.4
pnpm add react-hook-form@7.45.4   # Install exact
pnpm list react-hook-form          # Confirm
```

## Exact Versions Only
```json
{"dependencies": {"react": "18.2.0"}}  // ✅ No ranges like ^18.2.0
```
**Why:** Reproducible builds, prevent surprise breakages, explicit upgrades

## Common Commands
```bash
pnpm install                    # Install all
pnpm add package@1.2.3          # Production
pnpm add -D @types/pkg@1.2.3    # Dev
pnpm outdated                   # Check outdated
pnpm update package@1.3.0       # Update specific
pnpm audit                      # Security check
```

## Lockfile
```bash
git add pnpm-lock.yaml package.json  # Always commit
pnpm install --frozen-lockfile       # CI/CD
```

## Update Workflow
```bash
pnpm outdated                           # 1. Check
pnpm update react@18.3.0                # 2. Update exact
pnpm run build && pnpm typecheck        # 3. Test
git add package.json pnpm-lock.yaml     # 4. Commit
```

## Security & Troubleshooting
```bash
pnpm audit                # Check vulnerabilities
npm view pkg repository   # Vet before install

# Clear caches
pnpm store prune
rm -rf node_modules .next && pnpm install
```

## Anti-Patterns
- ❌ Auto-install without permission, version ranges (`^`/`~`), npm/yarn usage, skip testing post-install

## Validation
- [ ] Permission asked, version checked via `npm view`, exact version installed, `pnpm list` confirmed, lockfile committed, build/typecheck passed

## Read Full File If
Need common package examples or detailed troubleshooting.