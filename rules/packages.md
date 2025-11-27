# Package Management

**Goal**: Install packages safely with exact versions

**Always use**: pnpm (never npm or yarn)

**Never**: Auto-install without user permission

---

## Installation Process

**REQUIRED steps** for every package:

1. **Ask user permission**
2. **Check latest version**: `npm view package-name version`
3. **Install exact version**: `pnpm add package-name@1.2.3`
4. **Confirm**: `pnpm list package-name`

```bash
# ❌ Don't do this
pnpm add react-hook-form

# ✅ Follow the process
npm view react-hook-form version  # Check: 7.45.4
pnpm add react-hook-form@7.45.4   # Install exact
pnpm list react-hook-form          # Confirm
```

---

## Exact Versions Only

```json
// ❌ Don't use version ranges
{
  "dependencies": {
    "react": "^18.2.0",
    "next": "~14.0.0"
  }
}

// ✅ Use exact versions
{
  "dependencies": {
    "react": "18.2.0",
    "next": "14.0.4"
  }
}
```

**Why exact versions?**
- Reproducible builds
- Prevent surprise breakages
- Explicit upgrade decisions

---

## pnpm Commands

```bash
# Install all dependencies
pnpm install

# Add production dependency
pnpm add package@1.2.3

# Add dev dependency
pnpm add -D @types/package@1.2.3

# Check outdated
pnpm outdated

# Update specific package
pnpm update package@1.3.0

# Security audit
pnpm audit
pnpm audit --fix
```

---

## Development vs Production

```bash
# Production (ships to users)
pnpm add next@14.0.4
pnpm add react@18.2.0
pnpm add @tanstack/react-query@5.90.2

# Development (build tools)
pnpm add -D @types/react@18.2.37
pnpm add -D typescript@5.2.2
pnpm add -D @playwright/test@1.40.1
```

---

## Lockfile Management

**Always commit** pnpm-lock.yaml:

```bash
# ✅ Commit lockfiles
git add pnpm-lock.yaml package.json
git commit -m "Update dependencies"

# ❌ Never ignore lockfiles
echo "pnpm-lock.yaml" >> .gitignore  # Don't do this
```

**CI/CD** - use frozen lockfile:
```bash
pnpm install --frozen-lockfile
```

---

## Package Updates

```bash
# 1. Check what's outdated
pnpm outdated

# 2. Update specific packages
pnpm update react@18.3.0

# 3. Test after updates
pnpm run build
pnpm run typecheck
pnpm exec ast-grep scan

# 4. Commit changes
git add package.json pnpm-lock.yaml
git commit -m "Update React to 18.3.0"
```

---

## Security

```bash
# Check vulnerabilities
pnpm audit

# Auto-fix when possible
pnpm audit --fix

# High-severity issues - manual update
npm view package-name version
pnpm add package-name@latest
```

**Before installing**:
```bash
# Check package details
npm view package-name repository homepage maintainers
```

---

## Common Packages

### UI & Styling
```bash
pnpm add @radix-ui/react-dialog@1.0.5
pnpm add lucide-react@0.294.0
pnpm add class-variance-authority@0.7.0
pnpm add tailwind-merge@2.0.0
```

### Data & State
```bash
pnpm add @tanstack/react-query@5.90.2
pnpm add zustand@4.4.7
pnpm add zod@3.22.4
```

### Forms & Validation
```bash
pnpm add react-hook-form@7.45.4
pnpm add @hookform/resolvers@3.3.2
```

### Testing
```bash
pnpm add -D @playwright/test@1.40.1
pnpm add -D @storybook/react@7.5.3
```

### Types
```bash
pnpm add -D @types/node@20.8.0
pnpm add -D @types/react@18.2.37
pnpm add -D @types/react-dom@18.2.15
```

---

## Troubleshooting

### Clear Caches
```bash
pnpm store prune
rm -rf node_modules .next
pnpm install
```

### Peer Dependency Warnings
```bash
pnpm install --shamefully-hoist
```

### Duplicate Packages
```bash
pnpm ls --depth=0
```

### Performance (.npmrc)
```
auto-install-peers=true
shamefully-hoist=true
```

---

## Anti-Patterns

❌ Auto-install: `pnpm add package`
❌ Version ranges: `"react": "^18.0.0"`
❌ npm/yarn: `npm install`
❌ Ignoring lockfile: `.gitignore pnpm-lock.yaml`
❌ Skip testing: Install without running build/tests

✅ Ask → Check version → Exact install → Confirm
✅ Exact versions: `"react": "18.2.0"`
✅ pnpm only
✅ Commit lockfile
✅ Test after updates
