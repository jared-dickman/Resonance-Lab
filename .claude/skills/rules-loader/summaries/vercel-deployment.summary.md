# vercel-deployment.md Summary

**Lambda:** Ephemeral execution, no persistent state, cold starts ~50-200ms

**DB:** `POSTGRES_URL` + `max: 1` ONLY. Never `max > 1` or non-pooling URL

**Build:** `vercel:protect` blocks on failures

**Security:** Comprehensive headers (HSTS, CSP, CORS isolation), API routes prevent caching

**Monitoring:** Vercel Analytics, cron jobs for health/security/cleanup

**Environment:** Production secrets via Vercel dashboard only. Never copy from `.env.example` to `.env.local`.