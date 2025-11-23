# Configure PR Branch Deployments to Dev Server Only

## Objective
Modify GitHub Actions workflow to deploy every new PR branch exclusively to the dev backend server, preventing automatic production deployments for PR branches while maintaining production deployment for master branch merges.

## Current Architecture
- **Production Backend**: `https://srv1015344.hstgr.cloud` (port 8080)
- **Dev Backend**: `https://dev.srv1015344.hstgr.cloud` (port 8081)
- **Frontend Production**: Vercel auto-deploys from master
- **Frontend Preview**: Vercel auto-deploys from PR branches

## Requirements

### 1. Backend Deployment Strategy
- **PR Branches**: Deploy to dev backend container only (`backend-dev` on port 8081)
- **Master Branch**: Deploy to production backend container only (`backend` on port 8080)
- Use SSH to connect to VPS and run Docker Compose commands

### 2. Confirm Existing Vercel Environment Configuration
- **PR Deployments**: Use `NEXT_PUBLIC_API_BASE_URL=https://dev.srv1015344.hstgr.cloud`
- **Production**: Use `NEXT_PUBLIC_API_BASE_URL=https://srv1015344.hstgr.cloud`

### 3. GitHub Actions Workflow Changes
Review `.github/workflows/` directory and:
- Identify deployment jobs
- Add conditional logic based on branch type
- Configure SSH deployment to VPS
- Ensure dev deployments don't affect production

## Implementation Checklist

**GitHub Actions**:
- [ ] Add workflow dispatch trigger for manual deployments
- [ ] Add branch condition checks (master vs PR branches)
- [ ] Configure SSH keys as GitHub secrets
- [ ] Add deployment job for dev backend on PR creation/update
- [ ] Add deployment job for production backend on master merge
- [ ] Include health checks after deployment
- [ ] Add rollback capability on failure

**VPS Deployment Commands**:
- PR branches: `docker-compose up -d --build backend-dev`
- Master: `docker-compose up -d --build backend`

**Vercel Configuration**:
- Verify `vercel.json` settings for branch deployments
- Confirm environment variables are correctly scoped (preview vs production)

## Files to Review/Modify
- `.github/workflows/*.yml` - CI/CD pipeline
- `docker-compose.yml` - Container configuration
- `frontend/vercel.json` - Vercel deployment settings
- `frontend/.env.development` - Dev environment vars
- `frontend/.env.production` - Production environment vars

## Success Criteria
- Opening a new PR triggers dev backend deployment
- PR previews connect to dev.srv1015344.hstgr.cloud
- Merging to master triggers production backend deployment
- Production connects to srv1015344.hstgr.cloud
- No cross-contamination between dev and production deployments

## Security Considerations
- Store SSH private key in GitHub secrets
- Use read-only deploy keys where possible
- Limit SSH access to deployment commands only
- Add IP allowlisting if VPS supports it

## Testing Plan
1. Create test PR branch
2. Verify dev backend deployment triggered
3. Check Vercel preview uses dev backend URL
4. Merge PR to master
5. Verify production backend deployment triggered
6. Confirm production frontend uses production backend URL
