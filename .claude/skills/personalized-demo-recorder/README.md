# Personalized Demo Recorder

Generate company-specific PillarWizard demo videos for sales outreach (email/LinkedIn).

The skill will prompt you for:
- Company name (required)
- Industry (optional - inferred if omitted)

## What It Does

**Phase 1: Data Collection**
- Generates personalized pillar + cluster titles matching company domain
- Creates realistic content using industry-specific terminology
- Validates against JSON schema

**Phase 2: Handler Injection**
- Clones MSW handler structure
- Injects personalized data inline
- Preserves realistic API delays (1500-2500ms)

**Phase 3: Video Recording**
**- Verifies Storybook running on :6006
- Records 1920x1080 WebM video
- Captures full wizard flow (all 4 phases)**
- Auto-opens in QuickTime Player

**Phase 4: Asset Export**
- Bundles video + mock data + metadata
- Cleans up temporary MSW handlers
- Returns bundle directory path

## Output Structure

```
.claude/output/demo-artifacts/{company}-{timestamp}/
├── {company}-demo.gif          # Personalized demo video
├── mock-data.json                # Generated fixtures
└── metadata.json                 # Recording metadata
```

## Prerequisites

- Storybook running on `localhost:6006` (confirm and spawn with subagent using skills)
- QuickTime Player installed (macOS)
- PillarWizard all-four-phases story available

## Examples

**SaaS Company:**
```
Company: Stripe
Industry: Fintech
Pillar: "Developer-First Payment Infrastructure"
Clusters:
  - Embedded Finance for SaaS Platforms
  - Global Payment Compliance & Regulation
  - Revenue Recognition & Subscription Billing
```

**Manufacturing:**
```
Company: Tesla
Industry: Automotive
Pillar: "Electric Vehicle Innovation & Sustainability"
Clusters:
  - Battery Technology & Energy Storage
  - Autonomous Driving Software Architecture
  - Global Supply Chain Optimization
```

## Rollback Behavior

- Phase 1 fails → No artifacts created
- Phase 2 fails → Deletes mock-data.json
- Phase 3 fails → Deletes temp handler, keeps mock-data for retry
- Phase 4 fails → Keeps video + mock-data, skips metadata

## Architecture

**Orchestrator:** `SKILL.md` delegates to 4 subagents
**Subagents:** Markdown prompts in `subagents/`
**Scripts:** TypeScript automation in `scripts/`
**Template:** JSON schema in `templates/`
**Trigger:** `/demo` slash command

## Technical Details

**Video Format:** WebM (best quality/size for email/LinkedIn) or gif
**Resolution:** 1920x1080
**Story ID:** `wizard-pillar-generation-wizard--all-four-phases-to-completion`
