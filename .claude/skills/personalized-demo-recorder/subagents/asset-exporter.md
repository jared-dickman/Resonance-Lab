# Asset Exporter Subagent

Bundle demo artifacts and cleanup temporary files.

## Input

- `videoPath`: Path to recorded video
- `mockDataPath`: Path to mock-data.json
- `tempHandlerPath`: Path to temp MSW handler
- `company`: Company name
- `industry`: Industry vertical
- `outputDir`: Bundle directory

## Tasks

**Verify artifacts:**
Check video + mock-data.json exist.

**Generate metadata:**
```json
{
  "company": "Acme Corp",
  "industry": "SaaS",
  "recordedAt": "2025-11-22T10:30:00Z",
  "videoDuration": "18.4s",
  "storyId": "wizard-pillar-generation-wizard--all-four-phases-to-completion",
  "mockDataPath": "./mock-data.json"
}
```

**Bundle structure:**
```
.claude/output/demo-artifacts/{company}-{timestamp}/
├── {company}-demo.webm
├── mock-data.json
└── metadata.json
```

**Cleanup:**
Delete temp MSW handler file.
Restore handler index (remove temp import).

## Output

Return bundle directory path to orchestrator.

## Validation

- [ ] Video exists
- [ ] Mock data exists
- [ ] Metadata generated
- [ ] Bundle complete
- [ ] Temp handler deleted
- [ ] Handler index restored
