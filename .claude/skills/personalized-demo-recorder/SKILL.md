---
name: personalized-demo-recorder
description: Generate personalized PillarWizard demo videos for sales outreach
auto_trigger: false
keywords: [demo, video, personalized, sales, outreach]
---

# Personalized Demo Recorder

Generate company-specific PillarWizard demo videos for email/LinkedIn outreach.

## ⚠️ CRITICAL: 5-Cluster Requirement

**The wizard ALWAYS requires exactly 5 clusters.** This is non-negotiable and hardcoded in:
- `app/testing/fixtures/pillar-generation/wizard-fixtures.ts:62-67` (mockClusterTitlesDraft)
- Story expectations in WizardDemo.stories.tsx
- UI layout assumptions in cluster rendering

**Both subagents (data-collector + handler-injector) have programmatic validation to catch this early.**

**Quick verification before recording:**
```bash
# Should output "5"
jq '.clusters | length' .claude/output/demo-artifacts/{dir}/mock-data.json

# Should output "8" (5th cluster appears in 8 handler arrays)
grep -c "CLUSTER_5" app/testing/msw/handlers/tmp/.temp-demo-*.ts
```

If either fails → STOP and regenerate before recording.

## Workflow

### Phase 0: API Shape Discovery (CRITICAL - Run First)
**Read these files BEFORE generating mock data:**
- `app/features/pillar-generation/dto/session-generate-response.schema.ts` - Generate response shape
- `app/features/pillar-generation/dto/session-approve-response.schema.ts` - Approve response shapes
- `app/features/pillar-generation/dto/pillar-wizard-session-response.schema.ts` - Session shape
- `app/testing/fixtures/pillar-generation/api-response-fixtures.ts` - Example responses with correct structure

**Why:** MSW handlers must return exact TypeScript shapes. Reading schemas first prevents type mismatches.

### Phase 1: Data Collection
Delegate to `subagents/data-collector.md`:
- Prompt for company name (required) + industry (optional)
- LLM infers industry if omitted
- Generate personalized fixtures matching company domain (MUST match schemas from Phase 0)
- Output: `.claude/output/demo-artifacts/{company}-{timestamp}/mock-data.json`

### Phase 2: Handler Injection
Delegate to `subagents/handler-injector.md`:
- Clone `pillar-wizard.handlers.ts` structure
- Replace fixture imports with personalized inline data
- Preserve existing delays (1500-2500ms)
- **Output:** `app/testing/msw/handlers/tmp/.temp-demo-{timestamp}.ts` (tmp/ subdirectory)
- **Update import:** `app/testing/msw/handlers/index.ts` to reference tmp/ file

### Phase 3: Video Recording
Delegate to `subagents/video-recorder.md`:
- Verify Storybook on :6006
- Record Playwright video (1920x1080 WebM, **HEADLESS**)
- Navigate to **DemoRecording** story: `http://localhost:6006/iframe.html?id=wizard-pillar-generation-wizard--demo-recording&viewMode=story`
- Wait for completion signal
- **CRITICAL: Always call `page.close()`, `context.close()`, `browser.close()` to finalize video**
- Output: `{company}-demo.webm`

### Phase 4: Asset Export
Delegate to `subagents/asset-exporter.md`:
- Generate metadata.json
- Bundle artifacts (video + mock-data + metadata)
- Cleanup temp MSW handler
- Output: Bundle directory path

## Key Learnings

**Type safety matters:** Generate responses must include `success: true` field and match Zod schemas exactly

**Cluster count is CRITICAL:** Wizard requires exactly 5 clusters. Both data-collector and handler-injector now validate programmatically to prevent bugs.

**Handler ordering:** Place tmpHandlers FIRST in handlers array (index.ts) - MSW uses first matching handler

**Story-level MSW override:** Stories define their own MSW handlers in `parameters.msw.handlers`. Global handlers in index.ts don't apply unless story imports them.

**Cache clearing required:** Always run `rm -rf node_modules/.vite && rm -rf .next` before restarting Storybook after handler changes

**Screenshot verification:** Take screenshot of story BEFORE recording to verify personalized content loaded correctly

**Playwright video naming:** Playwright saves videos with hashed names. **ALWAYS rename after recording:**
```bash
mv *.webm {company}-demo.webm
```
Also generate email-friendly GIF preview:
```bash
ffmpeg -i {company}-demo.webm -vf "fps=10,scale=480:-1" -t 8 {company}-preview.gif
```

**Story delays for readability:** Production demos use centralized config (scripts/demo-recording/config.ts). See "Timing Configuration" section below for current values.

**Cleanup checklist:**
- Remove `app/testing/msw/handlers/tmp/.temp-demo-{timestamp}.ts`
- Remove import from `app/testing/msw/handlers/index.ts`
- Keep mock-data.json and video for user

## Pre-Flight Checklist

**Before recording ANY demo, validate:**

```bash
# 1. Verify cluster count in mock-data.json
CLUSTER_COUNT=$(jq '.clusters | length' .claude/output/demo-artifacts/{dir}/mock-data.json)
test "$CLUSTER_COUNT" = "5" || echo "ERROR: Need exactly 5 clusters, found $CLUSTER_COUNT"

# 2. Verify handler has 5 clusters in ALL arrays
grep -c "CLUSTER_5_TITLE" app/testing/msw/handlers/tmp/.temp-demo-*.ts
# Should return 8 (appears in 8 different response objects)

# 3. Verify Storybook is running with MSW enabled
curl -s http://localhost:6006 > /dev/null && echo "✓ Storybook ready"

# 4. Clear cache before recording
rm -rf node_modules/.vite .next

# 5. Take verification screenshot first
# Recording script does this automatically
```

## Timing Configuration

**Production quality requires realistic pacing** (scripts/demo-recording/config.ts):

```typescript
readDelay: 5500           // Time to read content (5.5s)
transitionDelay: 5000     // Transition + streaming (5s)
preScrollPause: 2500      // Pause before Phase 4 scroll
scrollDuration: 2000      // Smooth scroll animation
phase4ExtraReadTime: 2500 // Extra time for 5 clusters
completionDisplayTime: 4000 // Linger on success
```

**Total demo length:** ~90-120 seconds for professional presentation

## Debugging Common Issues

**Issue:** "Wizard expects 5 clusters but handler has 4"
**Fix:** Run validation in handler-injector subagent before accepting output

**Issue:** "Demo times out waiting for completion"
**Causes:**
- Handler not imported first in index.ts (MSW uses first match)
- Story using wrong MSW handlers (check parameters.msw.handlers)
- Cache not cleared after handler changes

**Issue:** "Personalized content not showing in demo"
**Fix:** Take screenshot first to verify, check browser console for MSW logs

**Issue:** "Video file too large (>10MB)"
**Fix:** Adjust timing config - current settings produce 4-5MB for ~2min video

## Production Quality Standards

**Video must have:**
- Realistic reading pace (not robotic clicking)
- Smooth transitions between phases
- All 5 clusters visible
- Professional pacing suitable for LinkedIn DMs
- Clear completion message display

**Validation gates:**
1. Mock data has exactly 5 clusters (jq check)
2. Handler has 5 clusters in all 8 locations (grep count)
3. Screenshot shows personalized content
4. Demo completes without timeout
5. Video size reasonable (<10MB for sharing)

## Rollback

Phase 1 fails → No artifacts
Phase 2 fails → Delete mock-data.json
Phase 3 fails → Delete temp handler from tmp/, keep mock-data for retry
Phase 4 fails → Keep video + mock-data, skip metadata

## References

- `scripts/record-storybook.ts` - Video recording pattern
- `app/testing/msw/handlers/pillar-wizard.handlers.ts` - Handler delays + response shapes
- `app/testing/fixtures/pillar-generation/api-response-fixtures.ts` - Canonical response examples
- `WizardPhaseTransitions.stories.tsx` - Story timing
