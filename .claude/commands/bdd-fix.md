# BDD Test Self-Healing

Autonomously diagnose and fix failing BDD tests by analyzing traces, updating POMs/fixtures, and validating fixes.

## Input Required

User provides one or more of:

- Failed test/scenario name
- Trace file path (test-results/\*/trace.zip)
- Screenshot path (optional)
- Error message from CI/console

## AI Analysis Workflow

### 1. Read Trace & Identify Failure

Open trace file, locate exact failure point:

- Which step failed?
- What was the error type (timeout, selector not found, assertion failed)?
- What was expected vs actual?

### 2. Classify Failure Type

**Selector Changed**

- Error: `locator.click: Target closed` or `Error: locator not found`
- Root cause: Component TestId changed
- Fix location: Fixture TestIds

**Timing Issue**

- Error: `TimeoutError: Locator.toBeVisible timeout`
- Root cause: Missing wait, race condition
- Fix location: POM assertions, add loading state handlers

**Assertion Failed**

- Error: `expect(locator).toContainText(...) failed`
- Root cause: Text changed, API response changed
- Fix location: Fixture Text constants

**Element Not Visible**

- Error: `expect(locator).toBeVisible() failed`
- Root cause: Loading state not handled, timing
- Fix location: POM flows/assertions

**API Mock Outdated**

- Error: Unexpected response shape, missing fields
- Root cause: API contract changed
- Fix location: MSW handlers, fixtures

### 3. Investigate Root Cause

**For Selector Changes**:

```bash
# Find component with changed testid
pnpm exec ast-grep --pattern 'data-testid=$$$' --lang tsx app/components/{domain}/
```

Compare against fixture TestIds

**For Timing Issues**:

- Check if POM has loading state assertions
- Check if step waits for async operations
- Review trace timeline for race conditions

**For Text Assertions**:

- Check component for text changes
- Check fixture Text constants
- Check API response in trace network tab

**For API Changes**:

- Review MSW handler response shape
- Compare against OpenAPI schema
- Check fixture mock responses

### 4. Generate Fix

**Update Fixture TestIds** (selector changed):

```typescript
// app/testing/fixtures/{domain}/{domain}-fixtures.ts
export const BlogPostTestIds = {
  createButton: 'blog-create-button', // was 'create-button'
  // ...
};
```

**Add Loading State Handling** (timing issue):

```typescript
// e2e/assertions/{page}.assertions.ts
export const createBlogPageAssertions = (page: Page, locators) => ({
  isLoading: async () => {
    await expect(locators.loadingSpinner).toBeVisible();
  },
  isLoadingGone: async () => {
    await expect(locators.loadingSpinner).not.toBeVisible({ timeout: 10000 });
  },
  // ...
});
```

**Update Fixture Text** (assertion changed):

```typescript
// app/testing/fixtures/{domain}/{domain}-fixtures.ts
export const BlogText = {
  createSuccess: 'Blog post created', // was 'Created successfully'
  // ...
};
```

**Update MSW Handler** (API changed):

```typescript
// app/testing/msw/handlers/{domain}.handlers.ts
export const blogHandlers = [
  http.post('/api/blog-posts', async () => {
    return HttpResponse.json({
      id: 'blog-123',
      title: 'Test',
      status: 'draft', // new field
      // ...
    });
  }),
];
```

### 5. Validate Fix Locally

```bash
# Run failing test 10 times
for i in {1..10}; do
  pnpm test:bdd -- --tags "@{scenario-tag}"
  if [ $? -ne 0 ]; then
    echo "FAILED on run $i"
    exit 1
  fi
done

echo "✅ All 10 runs passed - zero flakes"
```

### 6. Commit & Push Fix

```bash
git add -A
git commit -m "fix(bdd): repair {scenario-name}

Failure: {brief-description}
Root cause: {what-changed}
Fix: {what-was-updated}

Validated: 10/10 runs pass with zero flakes

Trace: {trace-file-path}"

git push
```

## Common Fix Patterns Reference

### Pattern 1: Component Refactor Changed TestId

**Before**: Single testid per button

```tsx
<Button data-testid="create-button">Create</Button>
```

**After**: Domain-prefixed testids

```tsx
<Button data-testid="blog-create-button">Create</Button>
```

**Fix**: Update fixture

```typescript
export const BlogPostTestIds = {
  createButton: 'blog-create-button', // Update here only
};
```

### Pattern 2: Missing Loading State

**Symptom**: Flaky test, sometimes passes/fails

```
Error: expect(locator).toBeVisible() timed out
```

**Fix**: Add loading assertions

```typescript
// Step definition
Then('I see the blog list', async function () {
  const blog = createBlogPage(this.page);
  await blog.assertions.isLoadingGone(); // Add this
  await blog.assertions.hasBlogList();
});
```

### Pattern 3: Success Message Changed

**Before**: Generic message

```typescript
export const BlogText = {
  createSuccess: 'Success',
};
```

**After**: Specific message

```typescript
export const BlogText = {
  createSuccess: 'Blog post created successfully',
};
```

### Pattern 4: New Required Field

**Symptom**: Form validation fails

```
Error: expect(success).toBeVisible() failed
```

**Fix**: Update fixture and flow

```typescript
// Fixture
export const mockCreateBlogRequest = {
  title: 'Test',
  content: 'Content',
  companyId: 'company-123', // New required field
};

// Flow
export const createBlogPageFlow = basePage => ({
  createBlog: async (title: string, content: string, companyId: string) => {
    // Add companyId parameter
  },
});
```

## Flakiness Tracking (Future Phase)

Track failures in database for trend analysis:

```sql
CREATE TABLE test_failures (
  scenario_name TEXT,
  failure_type TEXT,
  trace_path TEXT,
  screenshot_path TEXT,
  created_at TIMESTAMP,
  fix_attempted_at TIMESTAMP,
  fixed_at TIMESTAMP
);

-- Auto-trigger /bdd-fix when scenario fails 3+ times in 7 days
SELECT scenario_name, COUNT(*) as fail_count
FROM test_failures
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY scenario_name
HAVING COUNT(*) >= 3;
```

## Tools to Use

**Read trace**:

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';

const tracePath = 'test-results/.../trace.zip';
// Extract and analyze with Playwright trace viewer API
```

**Find changed selectors**:

```bash
pnpm exec ast-grep --pattern 'data-testid="$ID"' --lang tsx app/
```

**Search for text**:

```bash
pnpm exec ast-grep --pattern '"$TEXT"' --lang typescript app/
```

**Validate tests**:

```bash
pnpm test:bdd -- --tags "@{scenario}"
```

## Output Format

Provide structured summary:

```markdown
## Fix Summary

**Failed Scenario**: {scenario-name}
**Failure Type**: {selector-changed|timing-issue|assertion-failed|api-changed}
**Root Cause**: {what-changed}

## Changes Made

1. Updated {file-path}:{line-number}
   - Changed {what} from "{before}" to "{after}"

2. {additional-changes}

## Validation

✅ Ran test 10 times - all passed
✅ Zero flakes detected
✅ Ready for commit

## Next Steps

Run `git status` to review changes
Run `pnpm test:bdd` to verify all tests still pass
```
