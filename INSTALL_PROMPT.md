# Installation Prompt for Resonance Lab Code Quality Setup

## Task: Install and Configure All Code Quality Tools

You need to install and configure the complete code quality and security enforcement system that has been added to this repository.

## Step 1: Run Enhanced Setup Script

```bash
cd /Users/jrad/Documents/resonance-lab
chmod +x setup-linting-enhanced.sh
./setup-linting-enhanced.sh
```

This script will:

- Install all required npm packages (ESLint, ast-grep, Husky, etc.)
- Configure Git hooks that cannot be bypassed
- Set up lint-staged for incremental checking
- Create VS Code settings for auto-fix on save
- Add all necessary npm scripts to package.json

## Step 2: Verify Installation

After the setup script completes, verify everything is installed:

```bash
# Check ast-grep is working
npx ast-grep --version

# Check ESLint plugin is loaded
npm run lint:check

# Check Husky is configured
git config core.hooksPath
# Should output: .husky

# Test the linting rules
npm run test:ast-grep-rules
```

## Step 3: Fix Any Initial Violations

The project may have existing code that violates the new rules. Fix them:

```bash
# Auto-fix what's possible
npm run lint
npm run format

# Check for security violations
npm run ast-grep:scan

# If violations exist, you'll need to fix them manually
# The error messages will tell you exactly what to fix
```

## Step 4: Configure GitHub Repository (if you have access)

### Add GitHub Secrets:

Go to Settings → Secrets → Actions → New repository secret

Add these if you have them:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Enable GitHub Actions:

- Settings → Actions → General
- Allow all actions and reusable workflows

### Configure Branch Protection:

- Settings → Branches → Add rule for `main`
- Require status checks: `quality-security`, `build-test`, `enforce-protection`
- Require pull request reviews
- Include administrators

## Step 5: Test Everything Works

```bash
# Create a test branch
git checkout -b test/code-quality

# Make a test file with a violation
echo "export const Component = () => <div>Test</div>" > test.tsx

# Try to commit (should fail)
git add test.tsx
git commit -m "test: verify hooks work"
# This should FAIL with "Use function keyword for components"

# Fix the violation
echo "export function Component() { return <div>Test</div> }" > test.tsx

# Now it should work
git add test.tsx
git commit -m "test: verify hooks work"

# Clean up
git checkout main
git branch -D test/code-quality
rm test.tsx
```

## Step 6: Configure Your IDE

### VS Code:

The setup script already created `.vscode/settings.json` with:

- Format on save
- ESLint auto-fix on save
- Correct line endings

Just restart VS Code to apply.

### WebStorm/IntelliJ:

1. Settings → Languages & Frameworks → JavaScript → Prettier
   - Check "On code reformat"
   - Check "On save"
2. Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
   - Select "Automatic ESLint configuration"
   - Check "Run eslint --fix on save"

## What's Now Enforced

### 🔒 Security Rules (Cannot bypass):

- No hardcoded API keys/secrets
- No SQL injection vulnerabilities
- No XSS (innerHTML/dangerouslySetInnerHTML)
- Required Zod validation on APIs

### 📝 Code Quality (Auto-enforced):

- Function components only (no arrow functions)
- No console.log (use logger)
- No `as any` TypeScript
- No template literal classNames
- Centralized routing constants

### 🚫 Git Protection:

- Cannot commit to main/master directly
- Cannot skip hooks with --no-verify
- Must use conventional commits
- Automatic code formatting

## Available Commands After Installation

```bash
npm run lint          # Fix linting issues
npm run format        # Format with Prettier
npm run ast-grep:scan # Security scan
npm run check:all     # Run everything
npm run test:rules    # Test rule configurations
```

## Troubleshooting

### If hooks don't run:

```bash
npx husky install
git config core.hooksPath .husky
chmod +x .husky/*
```

### If ESLint fails:

```bash
# Check the plugin is found
ls scripts/eslint-plugin-resonance.mjs
# Re-run setup if missing
./setup-linting-enhanced.sh
```

### If ast-grep fails:

```bash
# Reinstall ast-grep
npm install --save-dev @ast-grep/cli
# Check rules exist
ls rules/*.yml
```

## Success Criteria

You'll know everything is working when:

1. ✅ Cannot commit code with violations
2. ✅ `npm run check:all` passes
3. ✅ Git hooks run automatically on commit
4. ✅ VS Code auto-fixes on save
5. ✅ GitHub Actions run on push (if configured)

## Important Notes

- **DO NOT** try to bypass these checks with `--no-verify` - it won't work
- **DO NOT** disable the hooks - they're required
- **DO** fix violations properly - no shortcuts
- **DO** read error messages - they explain exactly what's wrong

The system is designed to be unbypassable. Every piece of code must meet quality standards.
