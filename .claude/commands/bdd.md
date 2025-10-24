---
description: Generate complete BDD test suite from user description
---

# BDD Test Suite Generator

**User Request**: $ARGUMENTS

---

## PIPELINE OVERVIEW

This command orchestrates specialized skills to generate a complete, production-ready BDD test suite:

```
[1] gherkin-generator
    • Analyzes existing tests for consistency
    • Generates comprehensive scenarios (happy + loading + error)
    • Enforces @smoke tagging rules
    • Reuses step vocabulary
    ↓
[2] bdd-implementation-generator
    • Creates 7-layer test infrastructure
    • Generates locators, flows, assertions, intercepts, POMs, steps
    • Follows codebase patterns exactly
    ↓
[3] fixture-forge (existing skill)
    • Creates type-safe fixtures with TestIds + Text constants
    • Generates realistic mock data
    • Ensures Zod validation
    ↓
[4] ui-testid-injector
    • Injects data-testid attributes into UI components
    • Maps TestIds from fixtures to React elements
    • Ensures tests can find components
    ↓
[5] bdd-example-enforcer (existing skill)
    • Validates all patterns
    • Auto-fixes violations
    • Runs ast-grep scan + validation
    ↓
DONE ✅ - Production-ready test suite
```

---

## EXECUTION STEPS

### Step 1: Parse User Request

**Extract from**: `$ARGUMENTS`

```typescript
{
  feature: string          // What to test (e.g., "user login with Google")
  domain?: string          // Which domain (auth, billing, etc.) - infer if not provided
  context?: string         // Additional context
}
```

**Example requests**:
- "test Google OAuth login"
- "test keyword filtering by volume"
- "test billing page subscription management"

**If domain unclear**: Ask user to clarify before proceeding.

### Step 2: Invoke gherkin-generator

**Input**: User's feature description + domain

**Skill execution**:
1. Reads existing features in domain
2. Extracts step vocabulary
3. Checks for inconsistencies
4. Generates comprehensive scenarios:
   - Happy path (@smoke @domain)
   - Loading state (@domain @loading)
   - Error scenario (@domain @error)
5. Validates Gherkin syntax
6. Shows generated .feature file

**Output**:
- `e2e/features/{domain}/{feature}.feature`
- Report of scenarios created
- Validation results

**Checkpoint**: Show user the Gherkin, wait for approval before continuing.

### Step 3: Invoke bdd-implementation-generator

**Input**: Generated .feature file

**Skill execution**:
1. Parses scenarios to identify required elements
2. Generates 7 files following exact codebase patterns:
   - Fixtures (TestIds + Text + mock data)
   - Locators (using TestIds from fixtures)
   - Flows (1-3 line action methods)
   - Assertions (1-2 expect methods)
   - Intercepts (API mocking)
   - POM (factory with 5 layers)
   - Step definitions (safe-steps + unified pattern)
3. Self-validates structure
4. Shows implementation summary

**Output**:
- `app/testing/fixtures/{domain}/{domain}-fixtures.ts`
- `e2e/locators/{domain}-page.locators.ts`
- `e2e/flows/{domain}-page.flow.ts`
- `e2e/assertions/{domain}-page.assertions.ts`
- `e2e/intercepts/{domain}.intercepts.ts`
- `e2e/pages/{domain}-page.pom.ts`
- `e2e/steps/{domain}/{feature}.steps.ts`

**Checkpoint**: Files generated and saved. Show user the summary.

### Step 4: Invoke fixture-forge

**Input**: Generated step definitions + domain

**Skill execution**:
1. Analyzes step definitions to understand data needs
2. Checks if fixtures already exist (reuse if possible)
3. Generates TestIds constants
4. Creates Text constants for assertions
5. Generates realistic mock data
6. Validates against Zod schemas

**Output**:
- Updated `app/testing/fixtures/{domain}/{domain}-fixtures.ts`
- TestIds, Text constants, mock data

**Checkpoint**: Fixtures generated.

### Step 5: Invoke ui-testid-injector

**Input**: Generated TestIds from fixtures

**Skill execution**:
1. Reads TestIds from fixtures
2. Finds UI components in domain
3. Maps TestIds to React elements
4. Injects data-testid attributes
5. Adds fixture imports to components
6. Validates TypeScript compiles

**Output**:
- Updated UI components with data-testid attributes
- Report of mapped vs unmapped TestIds

**Checkpoint**: UI components ready for testing.

### Step 6: Invoke bdd-example-enforcer

**Input**: All generated files

**Skill execution**:
1. Runs `pnpm validate:bdd`
2. Runs `pnpm exec ast-grep scan`
3. Checks patterns against bdd-example.md
4. If violations found:
   - Auto-fix violations
   - Regenerate files
   - Re-validate
   - Repeat up to 3 times
5. Runs `pnpm typecheck`
6. Reports final status

**Output**:
- Validation report
- List of any remaining issues
- Pass/fail status

**Checkpoint**: Show validation results.

### Step 7: Run Smoke Test

**Execute**:
```bash
pnpm test:bdd:smoke --grep "@{domain}"
```

**Report**:
- Test execution results
- Passing/failing scenarios
- Screenshots if failures occur

### Step 8: Final Summary

**Report to user**:
```markdown
## BDD Test Suite Complete ✅

**Feature**: {feature name}
**Domain**: {domain}

**Generated Files**:
1. ✅ Feature file: e2e/features/{domain}/{feature}.feature
2. ✅ Fixtures: app/testing/fixtures/{domain}/{domain}-fixtures.ts (TestIds, Text, mock data)
3. ✅ Locators: e2e/locators/{domain}-page.locators.ts
4. ✅ Flows: e2e/flows/{domain}-page.flow.ts
5. ✅ Assertions: e2e/assertions/{domain}-page.assertions.ts
6. ✅ Intercepts: e2e/intercepts/{domain}.intercepts.ts
7. ✅ POM: e2e/pages/{domain}-page.pom.ts
8. ✅ Steps: e2e/steps/{domain}/{feature}.steps.ts

**Updated Components**:
9. ✅ UI components with data-testid attributes injected

**Scenarios**:
- ✅ Happy path (@smoke @{domain})
- ✅ Loading state (@{domain} @loading)
- ✅ Error handling (@{domain} @error)

**Validation**:
- ✅ Gherkin syntax valid
- ✅ Pattern validation passed
- ✅ AST-grep scan passed
- ✅ TypeScript compiled
- ✅ Smoke tests passed

**Run tests**:
```bash
pnpm test:bdd:smoke --grep "@{domain}"
```

**Next steps**:
1. Review generated code
2. Add testIds to UI components (if new elements)
3. Implement API routes (if new endpoints)
4. Run full test suite
```

---

## ERROR HANDLING

### If gherkin-generator detects inconsistencies:
- Report inconsistencies to user
- Ask how to resolve
- Block until resolved

### If bdd-implementation-generator fails:
- Show error details
- Attempt auto-fix
- If auto-fix fails, ask user for guidance

### If bdd-example-enforcer finds violations:
- Auto-fix up to 3 times
- If still failing, report violations
- Ask user to review manually

### If smoke tests fail:
- Show test output + screenshots
- Analyze failure cause
- Suggest fixes
- Do NOT block completion (tests may fail due to missing UI implementation)

---

## QUALITY GATES

**Block generation if**:
- Domain cannot be determined
- Step vocabulary conflicts detected
- Existing test patterns are inconsistent

**Warn but continue if**:
- Some test IDs don't exist in UI (may be new feature)
- API routes not found (may need to be implemented)
- Smoke tests fail (feature may not be fully implemented)

---

## USAGE EXAMPLES

### Example 1: New Feature
```
/bdd test user settings page with profile editing
```
**Expected flow**:
1. Infer domain: "profile" or "settings"
2. Generate Gherkin for editing profile
3. Generate full implementation
4. Validate patterns
5. Report completion

### Example 2: Expanding Existing Feature
```
/bdd add error scenarios to billing page
```
**Expected flow**:
1. Read existing billing.feature
2. Generate additional error scenarios
3. Update step definitions if needed
4. Validate patterns
5. Report completion

### Example 3: New Domain
```
/bdd test analytics dashboard with charts
```
**Expected flow**:
1. Detect new domain: "analytics"
2. Ask user to confirm domain name
3. Generate complete 7-layer structure
4. Validate patterns
5. Report completion

---

## INTEGRATION POINTS

**Reads from**:
- `llm/templates/bdd-example.md` (canonical patterns)
- `e2e/features/**/*.feature` (existing scenarios)
- `e2e/steps/**/*.steps.ts` (existing step vocabulary)
- `app/testing/fixtures/**/*` (existing TestIds)

**Writes to**:
- `e2e/features/{domain}/{feature}.feature`
- `app/testing/fixtures/{domain}/{domain}-fixtures.ts`
- `e2e/locators/{domain}-page.locators.ts`
- `e2e/flows/{domain}-page.flow.ts`
- `e2e/assertions/{domain}-page.assertions.ts`
- `e2e/intercepts/{domain}.intercepts.ts`
- `e2e/pages/{domain}-page.pom.ts`
- `e2e/steps/{domain}/{feature}.steps.ts`

**Validates with**:
- `pnpm validate:bdd`
- `pnpm exec ast-grep scan`
- `pnpm typecheck`
- `pnpm test:bdd:smoke`

---

## SKILL INVOCATION

**Invoke skills in sequence**:

```typescript
// 1. Generate Gherkin
const gherkinResult = await invokeSkill('gherkin-generator', {
  feature: userRequest.feature,
  domain: userRequest.domain,
})

// 2. Show Gherkin to user, wait for approval
if (!userApproves(gherkinResult)) {
  return // Stop pipeline
}

// 3. Generate implementation
const implementationResult = await invokeSkill('bdd-implementation-generator', {
  featureFile: gherkinResult.featureFile,
  domain: userRequest.domain,
})

// 4. Validate and enforce patterns
const validationResult = await invokeSkill('bdd-example-enforcer', {
  files: implementationResult.generatedFiles,
  autoFix: true,
  maxAttempts: 3,
})

// 5. Report final status
reportCompletion({
  gherkin: gherkinResult,
  implementation: implementationResult,
  validation: validationResult,
})
```

---

## NOTES

- **Smart inference**: Skills analyze existing code to maintain consistency
- **Auto-fix first**: Always attempt automatic fixes before asking user
- **Production-ready**: Generated code passes all validation checks
- **Minimal user input**: Only ask questions when truly ambiguous
- **No manual cleanup**: User should be able to run tests immediately