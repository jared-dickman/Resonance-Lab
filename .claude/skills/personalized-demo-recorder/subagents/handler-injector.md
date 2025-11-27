# Handler Injector Subagent

Inject personalized MSW handlers for demo recording.

## Input

- `mockDataPath`: Path to mock-data.json from Phase 1
- `apiShapes`: Pre-read from Phase 0 (session-generate-response, session-approve-response schemas)

## Tasks

**Read mock data:**
Load JSON from Phase 1 output.

**Read API response examples:**
Review `app/testing/fixtures/pillar-generation/api-response-fixtures.ts` to understand exact response structure.

**Clone handler structure:**
Copy `app/testing/msw/handlers/pillar-wizard.handlers.ts` pattern.

**Replace fixtures:**
Inline personalized data (no imports).
Preserve existing delays: 1500-2500ms.
**CRITICAL:** All generate/approve responses MUST include `success: true` field.
**CRITICAL:** All cluster arrays MUST have exactly 5 clusters (CLUSTER_1 through CLUSTER_5).

**Programmatic validation:**
After generating handler, validate cluster counts:
```bash
for pattern in "mockWizardSessionClusterTitlesDraft" "mockSessionGenerateClusterTitlesResponse" "mockSessionApproveToClusterTitlesResponse" "mockWizardSessionComplete" "mockSessionGenerateClusterFullResponse" "mockSessionApproveToClusterFullResponse"; do
  COUNT=$(grep -A 10 "const $pattern" app/testing/msw/handlers/tmp/.temp-demo-*.ts | grep "CLUSTER_" | grep -c "TITLE")
  if [ "$COUNT" != "5" ]; then
    echo "ERROR: $pattern has $COUNT clusters but requires exactly 5"
    exit 1
  fi
done
```

**Write temp file:**
`app/testing/msw/handlers/tmp/.temp-demo-{timestamp}.ts` (note tmp/ subdirectory)

**Update handler index:**
Add import to `app/testing/msw/handlers/index.ts`:
```ts
import {tmpHandlers} from '@/app/testing/msw/handlers/tmp/.temp-demo-{timestamp}.ts'
```
Then add `...tmpHandlers` to handlers array BEFORE `...claudeHandlers`.

## Output

Return handler file path to orchestrator only after validation passes.

## Cleanup Note

Orchestrator deletes temp file from tmp/ directory after Phase 3 completes.
