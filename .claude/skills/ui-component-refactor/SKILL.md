---
name: UI Component Refactor
description: Detects bloated components (>300 lines) and extracts focused subcomponents following project patterns
auto_trigger: true
keywords: [component, refactor, extract, bloated, large]
---

# UI Component Refactor

**Role:** Component Architecture Specialist

**Purpose:** Break down bloated components (>300 lines) into focused, maintainable subcomponents following project conventions.

---

## Workflow

### Detect Bloated Component

**Target:** Components exceeding 300 lines

```bash
wc -l app/components/**/*.tsx | rg "^\s*[3-9][0-9]{2,}" | rg -v "\.test\.|\.stories\."
```

**Report:**
- Component path
- Current line count
- Recommended max: 300 lines

### Analyze Component Structure

**Read component, identify:**

**Sections** - Distinct UI areas (header, body, footer, cards, lists)
**Repeated patterns** - Similar JSX blocks rendered multiple times
**State boundaries** - Independent state/hooks that could be isolated
**Render helpers** - Internal functions returning JSX

**Reference:** See `llm/rules/components.md` for structure patterns

### Plan Extraction

**For each extraction candidate:**

**Name:** Descriptive, follows PascalCase (`CurrentPlanCard`, `UsageMetersCard`)
**Props:** Explicit interface with proper types
**Responsibilities:** Single, clear purpose
**Location:** Co-located in same directory or subdirectory

**Example from BillingPage.tsx:**
```tsx
// Before: 400 lines in BillingPage.tsx
export function BillingPage() {
  // ... 400 lines of mixed concerns
}

// After: Orchestration in BillingPage.tsx (100 lines)
export function BillingPage() {
  const {plan, status, currentPeriodEnd} = useBillingSubscription()
  return (
    <div className="container max-w-7xl mx-auto p-6">
      <PageHeader />
      <CurrentPlanCard plan={plan} status={status} currentPeriodEnd={currentPeriodEnd} />
      <UsageMetersCard />
      <PlanComparisonCard currentPlan={plan?.slug || 'basic'} />
    </div>
  )
}

// Extracted: CurrentPlanCard.tsx (80 lines)
// Extracted: UsageMetersCard.tsx (120 lines)
// Extracted: PlanComparisonCard.tsx (140 lines)
```

### Create Subcomponents

**For each extracted component:**

**Critical patterns:**
- **Function keyword** (never arrow functions)
- **Absolute imports** (`@/app/...`)
- **Type-only imports** (`import type`)
- **Radix primitives** (`@/app/components/ui/*`)
- **cn() for classes** (never template strings)
- **Feature hooks** (never direct useQuery/fetch)
- **data-testid** via props when testable

**Reference:** `llm/rules/components.md`, `llm/rules/styling.md`

### Update Parent Component

**Modify original component:**

```tsx
// Add imports for extracted components
import {CurrentPlanCard} from '@/app/components/billing/CurrentPlanCard'
import {UsageMetersCard} from '@/app/components/billing/UsageMetersCard'

export function BillingPage() {
  // Keep orchestration logic
  const {plan, status, currentPeriodEnd, isLoading, error} = useBillingSubscription()

  // Replace inline JSX with component calls
  return (
    <div className="container max-w-7xl mx-auto p-6">
      <CurrentPlanCard plan={plan} status={status} currentPeriodEnd={currentPeriodEnd} />
      <UsageMetersCard />
    </div>
  )
}
```

**Remove:**
- Extracted JSX blocks
- Unused imports
- Helper functions moved to subcomponents

**Keep:**
- Top-level orchestration hooks
- Error/loading states if shared
- Page-level layout/structure

### Preserve Tests

**If tests exist:**

**Unit tests** - Update imports, adjust selectors if needed
**Storybook stories** - Create new stories for extracted components
**E2E tests** - Should work unchanged (testIds preserved)

**Add testId props:**
```tsx
// Parent passes testIds to children
<CurrentPlanCard
  plan={plan}
  testId={BillingTestIds.currentPlanCard}
/>

// Child accepts optional testId
interface CurrentPlanCardProps {
  plan: Plan
  testId?: string
}

export function CurrentPlanCard({plan, testId}: CurrentPlanCardProps) {
  return <Card data-testid={testId}>...</Card>
}
```

### Validate

**Run checks:**
```bash
pnpm typecheck
pnpm exec ast-grep scan
```

**Manual review:**
- [ ] Parent component <300 lines
- [ ] Each subcomponent <200 lines
- [ ] Function keyword used (not arrow)
- [ ] Absolute imports only
- [ ] cn() for conditional classes
- [ ] Semantic tokens (not raw colors)
- [ ] data-testid preserved via props
- [ ] No duplicate code between components
- [ ] Props explicitly typed
- [ ] Feature hooks (not direct TanStack)

---

## Extraction Patterns

### Card/Section Pattern
**When:** Distinct visual sections (cards, panels)

```tsx
// Before: Inline card
<Card>
  <CardHeader><CardTitle>Current Plan</CardTitle></CardHeader>
  <CardContent>{/* 50+ lines */}</CardContent>
</Card>

// After: Extracted component
<CurrentPlanCard plan={plan} status={status} />
```

### List Item Pattern
**When:** Repeated rendering with .map()

```tsx
// Before: Inline render function
{items.map((item) => (
  <div key={item.id}>{/* 30+ lines per item */}</div>
))}

// After: Extracted component
{items.map((item) => (
  <ItemCard key={item.id} item={item} />
))}
```

### State Boundary Pattern
**When:** Independent hooks/state management

```tsx
// Before: Multiple concerns in one component
export function DashboardPage() {
  const {users} = useUsers()          // User state
  const {billing} = useBilling()      // Billing state
  const {analytics} = useAnalytics()  // Analytics state
  // 400+ lines mixing all concerns
}

// After: Separated by concern
export function DashboardPage() {
  return (
    <>
      <UsersSection />     {/* Owns user state */}
      <BillingSection />   {/* Owns billing state */}
      <AnalyticsSection /> {/* Owns analytics state */}
    </>
  )
}
```

### Helper Function Pattern
**When:** Internal render helpers can be isolated

```tsx
// Before: Helper inside component
export function BlogPage() {
  function renderBlogCard(blog: Blog) {
    return <div>{/* 40 lines */}</div>
  }
  return <>{blogs.map(renderBlogCard)}</>
}

// After: Helper becomes component
export function BlogPage() {
  return <>{blogs.map((blog) => <BlogCard key={blog.id} blog={blog} />)}</>
}
```

---

## Completion Report

```markdown
## Component Refactor Complete

**Original Component:** {path} ({original_lines} lines)

**Extracted Components:**
- ✅ {ComponentName1}.tsx ({lines1} lines) - {responsibility1}
- ✅ {ComponentName2}.tsx ({lines2} lines) - {responsibility2}
- ✅ {ComponentName3}.tsx ({lines3} lines) - {responsibility3}

**Parent Component:** {path} ({new_lines} lines)

**Reduction:** {reduction}% smaller ({original_lines} → {new_lines} lines)

**Validation:**
- ✅ TypeScript compiled
- ✅ ast-grep validation passed
- ✅ Tests preserved/updated
- ✅ All components <300 lines
- ✅ Single responsibility maintained

**Ready for:** Code review, tests, commit
```