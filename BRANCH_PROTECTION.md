# Branch Protection Setup for Resonance Lab

## 🔒 GitHub Branch Protection Rules

To fully enforce CI/CD quality gates, configure these branch protection rules in GitHub:

### Navigate to Settings → Branches → Add Rule

## For `main` and `master` branches:

### ✅ Required Status Checks

Enable "Require status checks to pass before merging" and add:

- `quality-security`
- `build-test (20)`
- `enforce-protection`

### 🔒 Protection Settings

- [x] **Require a pull request before merging**
  - [x] Require approvals: 1
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [x] Require review from CODEOWNERS

- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - [x] Status checks listed above

- [x] **Require conversation resolution before merging**

- [x] **Require signed commits** (optional but recommended)

- [x] **Require linear history** (keeps git history clean)

- [x] **Include administrators** (enforce for everyone)

- [x] **Restrict who can push to matching branches**
  - Add specific users/teams who can merge

### 🚫 Never Allow

- [ ] Allow force pushes
- [ ] Allow deletions
- [ ] Allow bypassing the above settings

## For `develop` branch:

Similar to main but with relaxed settings:

- Require status checks but allow admins to bypass
- Require 1 approval
- Allow force pushes from specific users only

## CI/CD Pipeline Status

### ✅ GitHub Actions Configured

1. **Code Quality Workflow** (`code-quality.yml`)
   - ESLint, Prettier, TypeScript checks
   - ast-grep security scanning
   - Secret detection with Trufflehog

2. **Complete CI/CD Pipeline** (`ci-cd-complete.yml`)
   - Multi-stage pipeline
   - Security audit with npm audit, Snyk, OWASP
   - Automated Vercel deployments
   - Multi-Node version testing

### ✅ Vercel Integration

- **Build Script** (`vercel-build.sh`)
  - Runs quality checks before build
  - Fails deployment on violations
- **vercel.json** configured to use build script
- Preview deployments on PRs
- Production deployments on main/master

### ✅ Local Git Hooks (Husky)

- **Pre-commit**: All quality checks
- **Commit-msg**: Conventional commits
- **Pre-push**: Full validation suite
- Cannot be bypassed with `--no-verify`

## 🚀 Complete Setup Instructions

1. **Configure GitHub Secrets**

   ```
   Settings → Secrets → Actions → New repository secret
   ```

   Add these secrets:
   - `VERCEL_TOKEN` - From Vercel dashboard
   - `VERCEL_ORG_ID` - From Vercel project settings
   - `VERCEL_PROJECT_ID` - From Vercel project settings
   - `SNYK_TOKEN` - (Optional) From Snyk dashboard
   - `SONAR_TOKEN` - (Optional) From SonarCloud
   - `SLACK_WEBHOOK` - (Optional) For notifications

2. **Enable GitHub Actions**

   ```
   Settings → Actions → General
   ```

   - Allow all actions and reusable workflows
   - Read and write permissions

3. **Configure Branch Protection**
   - Follow the rules above
   - Test with a PR to ensure checks run

4. **Test the Pipeline**

   ```bash
   git checkout -b test/ci-cd
   echo "test" > test.txt
   git add test.txt
   git commit -m "test: verify CI/CD pipeline"
   git push origin test/ci-cd
   ```

   - Create PR
   - Verify all checks run
   - Verify Vercel preview deploys

## 📊 Monitoring

### Check Pipeline Status

- Actions tab in GitHub shows all workflow runs
- Vercel dashboard shows deployment status
- Pull requests show check status inline

### Failed Checks

If checks fail:

1. Click "Details" next to failed check
2. Review logs
3. Fix locally: `npm run check:all`
4. Push fixes
5. Checks re-run automatically

## 🔄 Maintenance

### Update Dependencies

```bash
npm update
npm audit fix
npm run check:all
```

### Update Rules

1. Modify rules in `/rules/*.yml` or `/scripts/eslint-plugin-resonance.mjs`
2. Test: `npm run test:ast-grep-rules`
3. Commit with: `chore(rules): update linting rules`

## ⚠️ Troubleshooting

### Vercel Build Fails

- Check logs in Vercel dashboard
- Ensure `vercel-build.sh` is executable
- Verify all npm scripts exist

### GitHub Actions Fail

- Check Actions tab for detailed logs
- Ensure all secrets are configured
- Verify file permissions

### Local Hooks Not Running

```bash
npx husky install
git config core.hooksPath .husky
```

## Summary

Your CI/CD is now configured with:

- ✅ **3 layers of protection**: Local hooks, GitHub Actions, Vercel builds
- ✅ **Cannot be bypassed**: Enforced at every level
- ✅ **Automated deployments**: Preview on PR, production on merge
- ✅ **Security scanning**: Multiple tools checking for vulnerabilities
- ✅ **Quality gates**: Code must pass all checks to deploy

**No bad code can reach production!**
