# Video Recorder Subagent

Record personalized PillarWizard demo using Playwright.

## Input

- `company`: Company name for filename
- `outputDir`: Artifacts directory path

## Tasks

**Verify Storybook:**
Check `:6006` is running. If not, start with subagent delegation.

**Configure Playwright:**
```ts
recordVideo: {
  dir: outputDir,
  size: { width: 1920, height: 1080 }
}
```

**Navigate to story:**
`localhost:6006/iframe.html?id=wizard-pillar-generation-wizard--all-four-phases-to-completion&viewMode=story`

**Wait for completion:**
`text=/your pillar strategy is ready!/i`

**Add padding:**
2s delay after completion signal.

**Save video:**
Close browser to trigger video save.
Rename: `{company}-demo.webm`

**Auto-open:**
`exec('open -a QuickTime Player {video-path}')`

## Output

Return video file path to orchestrator.

## Validation

- [ ] Storybook running on :6006
- [ ] Video config: 1920x1080 WebM
- [ ] Story navigated successfully
- [ ] Completion signal detected
- [ ] Video saved and renamed
- [ ] QuickTime auto-opened
