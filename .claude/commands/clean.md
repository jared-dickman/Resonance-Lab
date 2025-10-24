You are executing a comprehensive Clean Code refactoring following Uncle Bob's principles. Transform the codebase into self-documenting, enterprise-grade architecture.

## Your Mission

Refactor code to be so clear that non-technical stakeholders can understand business logic flow. Every function reads as prose. Zero duplication. Zero ambiguity. Zero technical debt.

**Philosophy**: If you need comments to explain it, the code isn't clean enough.

## Execution Steps

1. **Analyze**: Identify code smells (magic values, duplication, large functions, unclear names)
2. **Plan**: Create todo list with specific refactorings
3. **Execute**: Apply Clean Code principles systematically
4. **Verify**: Ensure tests pass and behavior unchanged
5. **Report**: Summarize improvements with metrics

## Core Clean Code Principles

### 1. SOLID Principles (Architecture Foundation)

**Single Responsibility Principle (SRP)**

- One class/function = one reason to change
- `OrderProcessor` shouldn't handle validation AND database AND logging
- Split: `OrderValidator`, `OrderRepository`, `OrderLogger`
- Each module owns exactly one concept

**Open-Closed Principle (OCP)**

- Open for extension, closed for modification
- Add new payment methods via `PaymentProcessor` interface, never modify core
- Use strategy pattern, polymorphism over conditionals
- New features = new classes, not edited classes

**Liskov Substitution Principle (LSP)**

- Child classes substitute parents without breaking behavior
- `Square` shouldn't extend `Rectangle` if it violates width/height independence
- Subclasses honor parent contracts completely
- No surprising exceptions or weakened guarantees

**Interface Segregation Principle (ISP)**

- Many focused interfaces > one bloated interface
- Don't force `SimplePrinter` to implement `IAllInOneMachine.fax()`
- Clients depend only on methods they use
- Split `IUserOperations` into `IUserReader`, `IUserWriter`, `IUserDeleter`

**Dependency Inversion Principle (DIP)**

- High-level modules depend on abstractions, not concrete implementations
- `OrderService` depends on `IPaymentGateway`, not `StripePaymentGateway`
- Inversion of control: frameworks call you, you don't call frameworks
- Enables testing, swappable implementations

### 2. Functions: The First Line of Organization

**Do One Thing**

- Functions do ONE thing at ONE level of abstraction
- Extract till you drop: if you can describe function with "and", split it
- `processOrderAndSendEmail()` → `processOrder()` + `sendOrderConfirmationEmail()`
- One level of abstraction per function (no mixing high-level + low-level)

**Small & Focused**

- **Target: 5-10 lines, Max: 20 lines** (fits on screen without scrolling)
- Ideal functions fit in your working memory
- Blocks inside `if`, `while` should be one-line function calls
- Long function = multiple responsibilities = refactor

**Descriptive Names**

- Name length proportional to scope breadth
- Loop iterator: `i`, `idx` (tiny scope)
- Module function: `calculateUserLifetimeValueWithDiscounts()` (broad scope)
- Verb for functions: `getUserOrders()`, `validateEmailFormat()`, `sendPaymentReceipt()`
- Noun for data: `activeSubscriptionEndDate`, `validatedUserInput`

**Argument Discipline**

- **Zero arguments**: Ideal (`getCurrentTimestamp()`)
- **One argument**: Excellent (`formatCurrency(amount)`)
- **Two arguments**: Good (`createUser(email, password)`)
- **Three arguments**: Acceptable with config object (`updateSettings({theme, language, timezone})`)
- **More than three**: Extract to configuration object or rethink design

**No Side Effects**

- Pure functions when possible: same input → same output, no external mutations
- If side effects necessary (I/O, state changes), make it OBVIOUS in name
- `checkPassword()` shouldn't log you in (side effect!)
- `checkPasswordAndLogin()` or `authenticateUser()` = clear
- Avoid output parameters: return new values instead

**No Flag Arguments**

- `render(true)` ← What does true mean?
- Split: `renderForAdmin()` vs `renderForUser()`
- Boolean parameters = function does two things
- Exception: Configuration objects where names are explicit

**Command Query Separation**

- Functions either DO something (command) or ANSWER something (query), never both
- `setUserName(name)` = command (returns void)
- `getUserName()` = query (no side effects)
- Don't: `checkUserExistsAndCreate()` (query + command)

### 3. Naming: The Art of Clarity

**Intent-Revealing Names**

- `d` → `elapsedTimeInDays`
- `getData()` → `getActiveSubscriptionsByUserId()`
- `arr1` → `validatedOrderItems`
- Name reveals WHAT and WHY, not HOW

**Pronounceable Names**

- `genymdhms` → `generationTimestamp`
- `modymdhms` → `modificationTimestamp`
- If you can't say it in conversation, rename it

**Searchable Names**

- Single letters only for short loop scopes
- `7` → `DAYS_IN_WEEK`
- `e` → `exception`, `error`, `element` (context-dependent)
- Name length = scope size

**Avoid Mental Mapping**

- Don't use `r` for URL because "r for request"
- Don't use `hp` for "homepage"
- Reader shouldn't translate your abbreviations
- Clarity > brevity

**Class Names: Nouns**

- `Customer`, `WikiPage`, `Account`, `AddressParser`
- NOT: `Manager`, `Processor`, `Data`, `Info` (too vague)

**Method Names: Verbs**

- `postPayment()`, `deletePage()`, `save()`
- Accessors: `getName()`, Mutators: `setName()`, Predicates: `isPosted()`

**Pick One Word Per Concept**

- Not: `fetch()` in one class, `retrieve()` in another, `get()` in third
- Choose: `get()` everywhere OR `fetch()` everywhere
- Consistency = predictability

**Avoid Puns**

- Don't use `add()` for insertion if you use it for arithmetic elsewhere
- Don't use `append()` and `add()` interchangeably
- One word = one meaning across codebase

### 4. Comments: The Failure of Expression

**Comments as Code Smell**

- Every comment represents a failure to write self-explanatory code
- Don't comment bad code—rewrite it
- `// check if user is eligible for discount` → `if (userIsEligibleForDiscount())`

**Acceptable Comments**

- **Legal comments**: Copyright, licensing
- **Explanation of intent**: Why this algorithm, not what it does
- **Warning of consequences**: "This takes 10 minutes to run"
- **TODO comments**: Tracked in issue system, temporary
- **Amplification**: Why something seemingly trivial is important

**Unacceptable Comments**

- **Redundant**: `i++; // increment i`
- **Misleading**: Out-of-date comments
- **Journal**: Change history (use Git)
- **Noise**: `// Constructor`
- **Commented-out code**: Delete it (Git preserves history)
- **HTML in code**: Generates unreadable source
- **Non-local information**: Comment describes something elsewhere

### 5. DRY: Don't Repeat Yourself (Zero Tolerance)

**Duplication Detection**

- **2+ occurrences = extract immediately**
- Scan for: identical logic, similar patterns, magic values
- Tools: ESLint `no-duplicate-code`, SonarQube

**Extraction Strategy**

- **Identical code**: Extract to named function
- **Similar patterns**: Extract to configurable utility
- **Magic values**: Extract to named constants/enums
- **Complex conditions**: Extract to predicate functions

**Shared Utilities Organization**

```
/utils
  /validation
    emailValidation.ts
    phoneValidation.ts
  /formatting
    currencyFormatting.ts
    dateFormatting.ts
  /api
    requestBuilder.ts
    errorHandler.ts
  /domain
    orderCalculations.ts
    userPermissions.ts
```

**Constants & Enums**

- No strings in business logic
- No numbers in business logic (except 0, 1, -1 in specific cases)
- Everything has a name and lives in one place

### 6. Error Handling: First-Class Concern

**Use Exceptions, Not Error Codes**

- Error codes scatter handling logic
- Exceptions separate happy path from error path
- `try-catch` isolates error handling

**Try-Catch: One Thing**

- Functions with `try-catch` should do ONLY error handling
- Extract try body into separate function

```typescript
function deletePageAndDependencies(page: Page): void {
  try {
    deletePageWithAllReferences(page);
  } catch (error) {
    logDeletionError(error);
    notifyAdminOfDeletionFailure(page, error);
  }
}
```

**Provide Context**

- Error messages are for humans
- Include: what failed, why it matters, what to do
- Bad: `Error: Invalid input`
- Good: `Email validation failed: "${input}" is not a valid email format. Use format: name@domain.com`

**Don't Return Null**

- Null returns force null checks everywhere
- Return empty collections, Optional types, or throw exceptions
- Bad: `getUsers()` returns `null`
- Good: `getUsers()` returns `[]`

**Don't Pass Null**

- Null parameters = null checks in every function
- Use default parameters, required parameters, or separate functions
- TypeScript: Use strict null checking

### 7. Structure & Organization

**Vertical Formatting**

- **Newspaper metaphor**: Most important info at top
- Public API first, implementation details last
- Related functions stay close
- Caller above callee when possible

**Horizontal Formatting**

- Max line length: 80-120 characters
- Use indentation to show hierarchy
- Space to show association: `x = a + b` not `x=a+b`
- Align related code vertically when it aids scanning

**File Size**

- Target: <300 lines per file
- Max: 500 lines (consider splitting)
- One primary concept per file

**Class Organization**

- Constants → static variables → instance variables → constructors → public methods → private methods
- Group by functionality, not by access level

### 8. Tests: The Safety Net

**Test One Concept Per Test**

- Each test validates one specific behavior
- Name: `should_ReturnEmptyArray_When_NoUsersExist`
- Given-When-Then structure

**Clean Test Code**

- Tests follow same clean code rules as production
- Readability even more important (tests are documentation)
- Extract test helpers, use builders for complex setups

**F.I.R.S.T Principles**

- **Fast**: Run quickly (milliseconds, not seconds)
- **Independent**: No test depends on another
- **Repeatable**: Same result every time
- **Self-Validating**: Boolean output (pass/fail)
- **Timely**: Written just before production code (TDD)

## Technical Architecture Standards

### TypeScript/React/Next.js (Frontend)

**Directory Structure**

```
frontend/
├── app/                          # Next.js app directory
├── components/
│   ├── ui/                       # Reusable UI primitives
│   ├── features/                 # Feature-specific components
│   └── layouts/                  # Page layouts
├── lib/
│   ├── constants/                # ALL constants
│   │   ├── api.constants.ts
│   │   ├── ui.constants.ts
│   │   ├── routes.constants.ts
│   │   └── validation.constants.ts
│   ├── enums/                    # Type-safe enumerations
│   │   ├── userRole.enum.ts
│   │   ├── apiStatus.enum.ts
│   │   └── viewMode.enum.ts
│   ├── types/                    # TypeScript interfaces/types
│   │   ├── api.types.ts
│   │   ├── domain.types.ts
│   │   └── ui.types.ts
│   ├── utils/                    # Pure utility functions
│   │   ├── validation/
│   │   ├── formatting/
│   │   ├── calculation/
│   │   ├── array/
│   │   └── string/
│   ├── hooks/                    # Custom React hooks
│   ├── services/                 # API/external service clients
│   └── contexts/                 # React contexts
└── public/
```

**TypeScript Configuration**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Component Rules**

- **Max 100 lines** per component file
- **Single responsibility**: One component = one UI concept
- **No business logic**: Move to hooks or services
- **Props interface**: Always define explicit types
- **Default exports**: Named exports only (searchability)

**Hooks Guidelines**

- Prefix with `use`: `useAuthenticatedUser()`, `useSongMetadata()`
- Extract ALL stateful logic from components
- Single responsibility per hook
- Return objects, not arrays (named destructuring)
- Document dependencies explicitly

**Constants Organization**

```typescript
// ❌ BAD: Magic values in code
if (user.role === 'admin') {
}
fetch('/api/songs');

// ✅ GOOD: Named constants
import { UserRole } from '@/lib/enums/userRole.enum';
import { API_ROUTES } from '@/lib/constants/api.constants';

if (user.role === UserRole.Admin) {
}
fetch(API_ROUTES.songs.list);
```

**Type Safety**

- **Zero `any`**: Use `unknown` and narrow types
- **Explicit return types**: On all functions
- **Discriminated unions**: For complex state
- **Branded types**: For domain primitives (UserId, Email, etc.)

### Go (Backend/Scraper)

**Directory Structure**

```
scraper/
├── cmd/
│   └── server/
│       └── main.go               # Entry point only
├── internal/
│   ├── constants/                # Package constants
│   │   └── constants.go
│   ├── domain/                   # Business entities
│   │   ├── song.go
│   │   └── artist.go
│   ├── repository/               # Data access
│   │   └── song_repository.go
│   ├── service/                  # Business logic
│   │   └── song_service.go
│   ├── api/                      # HTTP handlers
│   │   ├── handlers/
│   │   └── middleware/
│   └── util/                     # Utilities
│       ├── validation/
│       └── formatting/
└── pkg/                          # Exportable packages
```

**Go Standards**

- **Interfaces**: Small, focused (1-3 methods ideal)
- **Error wrapping**: Always provide context with `fmt.Errorf("%w", err)`
- **No global state**: Dependency injection via constructors
- **Pure functions**: Separate I/O from business logic
- **Package naming**: Short, lowercase, no underscores

**Constants Pattern**

```go
// ❌ BAD
if status == "active" { }

// ✅ GOOD
const (
    StatusActive   = "active"
    StatusInactive = "inactive"
    StatusPending  = "pending"
)

if status == StatusActive { }
```

**Error Handling**

```go
// ❌ BAD
if err != nil {
    return err
}

// ✅ GOOD
if err != nil {
    return fmt.Errorf("failed to fetch song metadata for ID %s: %w", songID, err)
}
```

### Universal Standards (All Languages)

**Import Organization**

1. Standard library
2. External dependencies (alphabetical)
3. Internal packages (alphabetical)
4. Relative imports (alphabetical)

```typescript
// 1. Standard library
import { readFile } from 'fs/promises';

// 2. External dependencies
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 3. Internal packages
import { API_ROUTES } from '@/lib/constants/api.constants';
import { formatSongDuration } from '@/lib/utils/formatting/duration';

// 4. Relative imports
import { SongCard } from './SongCard';
```

**File Naming**

- **TypeScript**: `camelCase.ts`, `PascalCase.tsx` (components)
- **Go**: `snake_case.go`
- **Constants**: `*.constants.ts`, `constants.go`
- **Types**: `*.types.ts`, `*.enum.ts`
- **Tests**: `*.test.ts`, `*_test.go`

**Logging Standards**

- **Never `console.log`**: Use structured logger
- **Log levels**: ERROR, WARN, INFO, DEBUG
- **Include context**: Request ID, user ID, operation
- **Never log secrets**: API keys, tokens, passwords
- **Structured format**: JSON for production

**Security Rules**

- API keys in environment variables only
- Never commit `.env` (use `.env.example`)
- Validate all external input
- Sanitize before database queries
- Use parameterized queries (no string concatenation)

## Refactoring Process

### Phase 1: Establish Foundation

1. Create project-wide constants files
2. Define comprehensive type system
3. Build core utility library
4. Set up shared enums

### Phase 2: Extract Duplication

1. Identify repeated patterns (min 2+ occurrences)
2. Extract to named, testable utilities
3. Replace all instances with utility calls
4. Verify behavior unchanged

### Phase 3: Function Decomposition

1. Break large functions (>20 lines) into small, single-purpose functions
2. Each function has clear input/output contract
3. Eliminate side effects or make explicit
4. Reduce parameter counts

### Phase 4: Naming & Clarity

1. Rename vague identifiers to reveal intent
2. Replace comments with self-explanatory code
3. Ensure business logic reads as natural language
4. Remove dead code

### Phase 5: Quality Tooling

1. ESLint + Prettier (strict rules)
2. Husky pre-commit hooks
3. TypeScript strict mode
4. Import linting (no circular deps, organized)
5. Automated formatting on save/commit

## Quality Automation: Comprehensive Tooling Setup

### Required Dependencies

```bash
# ESLint & TypeScript
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# ESLint plugins
npm install --save-dev eslint-plugin-import eslint-plugin-react eslint-plugin-react-hooks
npm install --save-dev eslint-plugin-jsx-a11y eslint-plugin-sonarjs

# Prettier
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier

# Git hooks
npm install --save-dev husky lint-staged

# Commitlint
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

### Complete ESLint Configuration

Create `frontend/.eslintrc.json`:

```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:sonarjs/recommended",
    "next/core-web-vitals",
    "prettier"
  ],
  "parserOptions": {
    "ecmaVersion": 2024,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "rules": {
    // Function Quality
    "max-lines-per-function": [
      "error",
      { "max": 20, "skipBlankLines": true, "skipComments": true }
    ],
    "max-params": ["error", 3],
    "complexity": ["error", 5],
    "max-depth": ["error", 3],
    "max-nested-callbacks": ["error", 3],

    // Naming & Code Quality
    "no-magic-numbers": ["error", { "ignore": [0, 1, -1], "ignoreArrayIndexes": true }],
    "no-console": "error",
    "no-debugger": "error",
    "no-alert": "error",
    "prefer-const": "error",
    "no-var": "error",
    "eqeqeq": ["error", "always"],
    "no-duplicate-imports": "error",

    // TypeScript Specific
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": ["error", { "allowExpressions": true }],
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/strict-boolean-expressions": "error",

    // Import Organization
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "pathGroups": [
          {
            "pattern": "react",
            "group": "external",
            "position": "before"
          },
          {
            "pattern": "@/lib/**",
            "group": "internal",
            "position": "before"
          }
        ],
        "pathGroupsExcludedImportTypes": ["react"],
        "alphabetize": { "order": "asc", "caseInsensitive": true },
        "newlines-between": "always"
      }
    ],
    "import/no-duplicates": "error",
    "import/no-cycle": "error",
    "import/no-self-import": "error",
    "import/no-useless-path-segments": "error",

    // React Specific
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "react/jsx-no-target-blank": "error",
    "react/jsx-key": "error",
    "react/no-array-index-key": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",

    // Code Smell Detection (SonarJS)
    "sonarjs/cognitive-complexity": ["error", 10],
    "sonarjs/no-duplicate-string": ["error", 3],
    "sonarjs/no-identical-functions": "error",
    "sonarjs/no-collapsible-if": "error",
    "sonarjs/prefer-immediate-return": "error",

    // Accessibility
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/click-events-have-key-events": "warn"
  },
  "settings": {
    "react": {
      "version": "detect"
    },
    "import/resolver": {
      "typescript": {
        "alwaysTryTypes": true,
        "project": "./tsconfig.json"
      }
    }
  }
}
```

### Prettier Configuration

Create `frontend/.prettierrc.json`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "bracketSpacing": true,
  "jsxSingleQuote": false,
  "quoteProps": "as-needed"
}
```

Create `frontend/.prettierignore`:

```
node_modules
.next
dist
build
coverage
.vercel
*.log
```

### Husky Setup

Initialize Husky:

```bash
npx husky-init && npm install
```

Create `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Run lint-staged
npx lint-staged

# Type check
echo "🔎 Type checking..."
cd frontend && npm run type-check

echo "✅ Pre-commit checks passed!"
```

Create `.husky/commit-msg`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit ${1}
```

Create `.husky/pre-push`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🧪 Running pre-push checks..."

# Run tests
cd frontend && npm test

# Build check
echo "🏗️ Build check..."
npm run build

echo "✅ Pre-push checks passed!"
```

### Lint-Staged Configuration

Add to `frontend/package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write", "bash -c 'npm run type-check'"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

### Commitlint Configuration

Create `commitlint.config.js`:

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'refactor', // Code refactor (no functional changes)
        'perf', // Performance improvement
        'style', // Code style (formatting, semicolons, etc.)
        'test', // Adding/updating tests
        'docs', // Documentation
        'chore', // Maintenance tasks
        'ci', // CI/CD changes
        'revert', // Revert previous commit
      ],
    ],
    'subject-case': [2, 'always', 'sentence-case'],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100],
  },
};
```

### Package.json Scripts

Add to `frontend/package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx --max-warnings 0",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,json,md}\"",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "validate": "npm run lint && npm run type-check && npm run test && npm run build",
    "prepare": "cd .. && husky install frontend/.husky"
  }
}
```

### TypeScript Strict Mode

Update `frontend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./*"]
    },

    // Strict Type Checking
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Additional Checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### VSCode Workspace Settings

Create `frontend/.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],
  "files.eol": "\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true
}
```

### Go Linting (Backend/Scraper)

Install `golangci-lint`:

```bash
# macOS
brew install golangci-lint

# Or via go install
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
```

Create `.golangci.yml`:

```yaml
linters:
  enable:
    - gofmt
    - goimports
    - govet
    - errcheck
    - staticcheck
    - unused
    - gosimple
    - structcheck
    - varcheck
    - ineffassign
    - deadcode
    - typecheck
    - goconst # Find repeated strings that should be constants
    - dupl # Find duplicated code
    - gocritic # Opinionated linter
    - gocyclo # Cyclomatic complexity
    - funlen # Function length
    - misspell # Spell checking
    - unconvert # Unnecessary type conversions
    - unparam # Unused function parameters
    - nakedret # Naked returns
    - prealloc # Slice preallocation

linters-settings:
  gocyclo:
    min-complexity: 10
  funlen:
    lines: 50
    statements: 30
  goconst:
    min-len: 2
    min-occurrences: 2

issues:
  exclude-use-default: false
  max-issues-per-linter: 0
  max-same-issues: 0
```

Add to scraper scripts:

```bash
# Format
gofmt -w .
goimports -w .

# Lint
golangci-lint run

# Pre-commit hook for Go
git diff --cached --name-only --diff-filter=ACM | grep '\.go$' | xargs gofmt -w
git diff --cached --name-only --diff-filter=ACM | grep '\.go$' | xargs goimports -w
```

## Success Criteria

✅ **Zero Magic Values**: All strings/numbers are named constants
✅ **Zero Duplication**: All patterns (2+ uses) extracted to utils
✅ **Function Size**: 95%+ functions under 20 lines
✅ **Type Safety**: Zero `any`, comprehensive types
✅ **Self-Documenting**: Non-developers understand business logic flow
✅ **Automated Quality**: Husky prevents non-compliant commits
✅ **Production Grade**: Enterprise-ready, mission-critical quality

## Implementation Strategy

1. **Start Small**: Pick one module/feature area
2. **Measure Baseline**: Count magic values, duplications, function sizes
3. **Refactor Systematically**: Follow Phase 1-5 order
4. **Verify**: Tests pass, behavior unchanged
5. **Expand**: Apply to next module
6. **Iterate**: Continuous improvement

## Important Constraints

- **Never use `as any`** to fix TypeScript errors
- **Use custom logging utils**, never `console.log` in production code
- **Secret keys stay secret** - never in network requests
- **Minimal test fixtures** - one request/response pair sufficient
- **No backup files/components** during refactoring
- **Always confirm before commits**

## Output Expectations

When complete, provide:

- Summary of changes (constants added, utils created, functions refactored)
- Metrics (magic values eliminated, duplication removed, avg function size)
- Tooling setup confirmation (ESLint, Husky, Prettier configured)
- Next steps for maintaining standards
