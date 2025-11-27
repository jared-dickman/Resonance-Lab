# Data Collector Subagent

Generate company-specific PillarWizard mock data for personalized demos.

## Input

- `company`: Company name (required)
- `industry`: Industry vertical (optional - LLM infers if omitted)

## Tasks

**Prompt user:**
Ask for company name (required). If industry omitted, infer from company name using web search or LLM knowledge.

**Generate personalized fixtures:**
- Pillar title matching industry vertical
- **EXACTLY 5 cluster titles** relevant to company domain (CRITICAL: Wizard requires exactly 5)
- Realistic content snippets using company terminology
- Use industry-specific jargon and pain points

**Validate schema:**
Match `templates/mock-data-template.json` structure.

**Programmatic validation:**
After generating mock-data.json, run this check:
```bash
CLUSTER_COUNT=$(jq '.clusters | length' .claude/output/demo-artifacts/{company}-{timestamp}/mock-data.json)
if [ "$CLUSTER_COUNT" != "5" ]; then
  echo "ERROR: Generated $CLUSTER_COUNT clusters but wizard requires exactly 5"
  exit 1
fi
```

**Write output:**
`.claude/output/demo-artifacts/{company}-{timestamp}/mock-data.json`

## Output

Return JSON file path to orchestrator.

## Example

Company: "Stripe"
Industry: "Fintech"

Pillar: "Developer-First Payment Infrastructure"
Clusters:
- "Embedded Finance for SaaS Platforms"
- "Global Payment Compliance & Regulation"
- "Revenue Recognition & Subscription Billing"

## Validation

- [ ] Company name provided
- [ ] Industry identified (inferred or explicit)
- [ ] Pillar + EXACTLY 5 clusters generated (run jq validation above)
- [ ] Content uses company-specific terminology
- [ ] JSON matches template schema
- [ ] File written to correct path
