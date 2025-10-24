---
name: Fixture Forge
description: Auto-invoked when creating or updating test fixtures. Ensures type-safe, reusable fixtures shared across Vitest, Storybook, and Playwright with programmatic traceability.
auto_trigger: true
keywords: [fixture, test data, mock data, MSW, test fixtures, create fixture, update fixture]
---

# Fixture Forge

**Mode**: Centralized Fixture Manager - Creates type-safe, traceable fixtures for enterprise testing

## Core Principles

**Contextual intelligence** - Parse Gherkin, plain text, user stories to understand intent
**Human to technical translation** - Map product language to API contracts
**Type safety with Zod** - All fixtures validated against Zod schemas
**Single source of truth** - Vitest, Storybook, Playwright use same fixtures
**Programmatic traceability** - Track fixture usage across codebase
**Minimal data** - One request/response pair per endpoint
**Fun names** - Creative test data (Steve McTestFace style)
**Reusable & extensible** - Simple patterns that scale

## Workflow

### Understand User Intent

**Parse context from multiple sources:**

**From Gherkin/BDD scenarios:**
```gherkin
Scenario: User creates a blog post
  Given I am logged in as "Ada Lovelace"
  When I create a post titled "The Future of Computing"
  Then I should see the post in my dashboard
```

**Extract:**
- User persona: "Ada Lovelace" → fixture username
- Content: "The Future of Computing" → fixture blog title
- Domain: blog posts → `/api/blog-posts` endpoint

**From plain text:**
```
"We need to test the payment flow for a $50 subscription"
```

**Extract:**
- Domain: payments/subscriptions
- Amount: $50 → fixture price
- Action: payment flow → POST /api/payments endpoint

**From user story:**
```
"As a user, I want to invite team members by email"
```

**Extract:**
- Domain: team/invitations
- Action: invite → POST /api/invitations
- Input: email → fixture email field

**Contextual understanding:**
- Map human intent to technical endpoints
- Infer API contract from feature description
- Translate business language to schema fields
- Create realistic data that tells the story

### Analyze Context

**Before creating:**
```bash
# Search for existing fixtures
find app/testing/fixtures -name "*${feature}*fixtures.ts"

# Check feature types/schemas
find app/features/${feature} -name "*.types.ts" -o -name "*schemas.ts"

# Read Gherkin features for context
find e2e/features -name "*.feature" | xargs grep -l "${domain}"
```

**Determine:**
- Does fixture already exist? (reuse if yes)
- What's the API endpoint? (one fixture per endpoint)
- What Zod schemas define the contract?
- What user intent are we mocking? (context drives data)
- Where is fixture used? (track references)

### Check Existing Usage

**Programmatic traceability:**
```bash
# Find all imports of fixture (if updating)
grep -r "import.*${fixtureName}" app/ e2e/ --include="*.ts" --include="*.tsx"

# Find MSW handler usage
grep -r "${endpointPath}" app/testing/msw/handlers/

# Find test usage
grep -r "${FeatureText}" e2e/ app/ --include="*.test.ts" --include="*.spec.ts" --include="*.stories.ts"
```

**Decision:**
- Existing fixture: Show usage, ask to reuse/extend vs create new
- No fixture: Create new with traceability built in

### Create Fixture File

**Location:** `app/testing/fixtures/${feature}/${feature}-fixtures.ts`

**Template:**
```typescript
import type {FeatureRequest, FeatureResponse} from '@/app/features/${feature}/schemas'

/**
 * ${Feature} Fixtures - /api/${endpoint}
 *
 * Used by:
 * - MSW: app/testing/msw/handlers/${feature}-handler.ts
 * - Vitest: [auto-tracked on import]
 * - Playwright: [auto-tracked on import]
 * - Storybook: [auto-tracked on import]
 *
 * Single request/response pair for full API shape.
 * Fun, creative test data with type safety.
 */

export const ${Feature}Text = {
  field1: 'Steve McTestFace',
  field2: 'Building the future, one test at a time',
} as const

export const mock${Feature}Request: FeatureRequest = {
  field1: ${Feature}Text.field1,
}

export const mock${Feature}Response: FeatureResponse = {
  id: '${feature}-test-123',
  field1: ${Feature}Text.field1,
  field2: ${Feature}Text.field2,
  createdAt: '2025-01-15T12:00:00Z',
}
```

**Naming conventions:**
- Text constants: `${Feature}Text` (MessageText, UserText, BlogText)
- Request: `mock${Feature}Request`
- Response: `mock${Feature}Response`
- Fun data: Creative names, whimsical but realistic

**Fun name examples:**
- Names: Steve McTestFace, Ada Lovelace-Test, Grace Debugger
- Emails: test.legend@example.com, qa.superhero@test.dev
- Titles: "The Art of Perfect Testing", "Bug Hunting for Fun and Profit"
- Content: "This is not just a test. It's a way of life."

### Validate Against Zod Schema

**Critical validation:**
```typescript
// Add runtime validation check in fixture file
import {featureRequestSchema, featureResponseSchema} from '@/app/features/${feature}/schemas'

// Validate at module load (compile-time safety)
featureRequestSchema.parse(mock${Feature}Request)
featureResponseSchema.parse(mock${Feature}Response)
```

**Run validation:**
```bash
# TypeScript compilation catches type errors
pnpm typecheck

# Runtime validation catches Zod schema violations
tsx -e "import('./app/testing/fixtures/${feature}/${feature}-fixtures.ts')"
```

### Update Fixture Index

**Auto-update:** `app/testing/fixtures/index.ts`

```typescript
// Add export
export * from './${feature}/${feature}-fixtures'
```

**Verify:**
```bash
# Ensure export works
tsx -e "import {${Feature}Text} from './app/testing/fixtures'"
```

### Track Usage & Create References

**Document usage locations:**
- Update fixture file JSDoc with actual usage
- Track in comments where fixture is imported

**Common usage patterns:**
```typescript
// MSW Handler
http.get('/api/${endpoint}', () => {
  return HttpResponse.json(mock${Feature}Response)
})

// Vitest test
const result = await ${feature}Service.create(mock${Feature}Request)
expect(result).toMatchObject(mock${Feature}Response)

// Playwright intercept
await intercepts.${feature}(page, { body: mock${Feature}Response })

// Storybook story
export const Default: Story = {
  args: {
    data: mock${Feature}Response
  }
}
```

### Verify No Breakage

**Run affected tests:**
```bash
# Find files that import this fixture
AFFECTED_FILES=$(grep -rl "import.*${feature}-fixtures" app/ e2e/ --include="*.test.ts" --include="*.spec.ts" --include="*.stories.ts")

# Run tests for affected files
pnpm test ${AFFECTED_FILES}

# Run BDD smoke if e2e uses it
if echo "$AFFECTED_FILES" | grep -q "e2e/"; then
  pnpm test:bdd:smoke
fi

# Run Storybook tests if stories use it
if echo "$AFFECTED_FILES" | grep -q ".stories."; then
  pnpm test:storybook
fi
```

**Validation checklist:**
- ✅ All affected tests pass
- ✅ TypeScript compiles
- ✅ Zod validation succeeds
- ✅ No duplicate fixtures for same endpoint
- ✅ Fixture exported from index

### Report Traceability

**Generate usage report:**
```
📦 Fixture Created: ${Feature}Text

Location: app/testing/fixtures/${feature}/${feature}-fixtures.ts
Endpoint: /api/${endpoint}
Type safety: ✅ Validated against Zod schemas

Usage tracked in:
- MSW: app/testing/msw/handlers/${feature}-handler.ts
- Vitest: [N tests found]
- Playwright: [N step definitions]
- Storybook: [N stories]

Validation: ✅ All tests pass
```

## Fixture Patterns

**Minimal data principle:**
```typescript
// ✅ Good: One request/response pair
export const BlogText = {
  title: 'The Testing Manifesto',
  content: 'Write tests like your users depend on them. Because they do.',
} as const

export const mockBlogRequest = { title: BlogText.title, content: BlogText.content }
export const mockBlogResponse = { id: 'blog-test-1', ...mockBlogRequest, status: 'draft' }
```

**Reusable & extensible:**
```typescript
// ✅ Good: Base fixture can be extended
export const baseBlogResponse = { id: 'blog-1', title: BlogText.title }

// Tests can extend as needed
const publishedBlog = { ...baseBlogResponse, status: 'published' }
const draftBlog = { ...baseBlogResponse, status: 'draft' }
```

## Anti-Patterns

❌ **Multiple fixtures per endpoint:**
```typescript
// Too many - keep it minimal
export const mockSuccessResponse = {...}
export const mockDemoResponse = {...}
export const mockTestResponse = {...}
```

❌ **No Zod validation:**
```typescript
// Missing runtime safety
export const mockResponse = {
  field: 'value'  // No schema validation
}
```

❌ **Hardcoded strings in tests:**
```typescript
// Should use fixture constant
await expect(page.getByText('Hello, world!')).toBeVisible()
```

❌ **No traceability:**
```typescript
// No JSDoc tracking usage
export const BlogText = {...}
```

✅ **Single fixture with traceability:**
```typescript
/**
 * Blog Fixtures - /api/blog-posts
 *
 * Used by:
 * - MSW: app/testing/msw/handlers/blog-handler.ts
 * - Vitest: 12 tests
 * - Playwright: e2e/steps/blog/*.steps.ts
 * - Storybook: app/features/blog/**/*.stories.tsx
 */
export const BlogText = {
  title: 'Confessions of a Test Engineer',
  content: 'It was the best of tests, it was the worst of tests.',
} as const
```

## Programmatic Traceability

**Usage tracking script:**
```bash
# Find all fixture imports
grep -r "import.*fixtures" app/ e2e/ --include="*.ts" --include="*.tsx" | \
  sed 's/.*from.*fixtures\/\(.*\)\/\(.*\)-fixtures.*/\1/' | \
  sort | uniq -c

# Find unused fixtures
for fixture in app/testing/fixtures/**/*-fixtures.ts; do
  name=$(basename $fixture .ts)
  count=$(grep -r "import.*$name" app/ e2e/ --include="*.ts" --include="*.tsx" | wc -l)
  if [ $count -eq 0 ]; then
    echo "⚠️  Unused: $fixture"
  fi
done
```

## Stale Fixture Detection

**Auto-check before creating:**
```bash
# Find fixtures with no imports (stale)
FIXTURE_FILES=$(find app/testing/fixtures -name "*-fixtures.ts" ! -name "index.ts")

for fixture in $FIXTURE_FILES; do
  IMPORTS=$(grep -r "$(basename $fixture .ts)" app/ e2e/ --include="*.ts" --include="*.tsx" | wc -l)
  if [ $IMPORTS -eq 0 ]; then
    echo "⚠️  Stale fixture: $fixture (0 imports)"
  fi
done
```

## References

- `llm/rules/testing-fixtures.md` - Fixture standards and patterns
- `llm/rules/testing-playwright.md` - E2E testing with fixtures
- `llm/rules/testing-storybook.md` - Component testing with fixtures
- `llm/rules/vitest.md` - Unit testing with fixtures
- `app/testing/fixtures/messages/message-fixtures.ts` - Example fixture