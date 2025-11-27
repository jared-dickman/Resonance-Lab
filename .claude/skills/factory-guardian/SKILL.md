---
name: Factory Guardian
description: Validates factory builders use domain types. Prevents production bugs from test data drift.
auto_trigger: true
keywords: [factory, builder, type safety, domain entity, test data drift, factories.ts, type validation, compile-time safety, schema drift, entity sync, factory type mismatch, inline types, satisfies pattern, domain type import]
---

# Factory Guardian

**Mission**: Ensure factory builders stay type-safe and synchronized with domain entities.

**Why**: Type-drifted factories = tests pass but production breaks. Domain adds required `companyId` for security → factory doesn't know → tests pass → data leak in production.

---

## Pattern

**❌Unsafe:**
```typescript
export class UserBuilder {
  private data: {
    id: string
    email: string
  }
}
```

**✅ Required (safe):**
```typescript
import type { UserEntity } from '@/app/features/user/domain/user'

export class UserBuilder {
  private data: UserEntity

  constructor() {
    const initial: UserEntity = { ... }  // Validates structure
    this.data = initial
  }

  build(): UserEntity {
    return { ...this.data } satisfies UserEntity
  }
}
```

**Impact**: Domain changes → compile error → tests won't run until fixed.

---

## Workflow

### 1. Map Builders to Domain Types

```typescript
UserBuilder → app/features/user/domain/user.ts → UserEntity
CompanyBuilder → app/features/companies/domain/company.ts → CompanyEntity
ThreadBuilder → app/features/threads/dto/thread-response.schema.ts → threadSchema
UserCompanyBuilder → app/features/user-companies/domain/user-company.ts → UserCompanyEntity
```

### 2. Validate Each Builder

Check:
- Imports domain type
- Uses domain type in `private data`
- Constructor validates: `const initial: DomainType = { ... }`
- Build returns: `satisfies DomainType`

### 3. Generate Validation Test

Create `app/testing/utils/factories.test.ts`:
```typescript
import { buildUser, buildCompany } from './factories'
import type { UserEntity } from '@/app/features/user/domain/user'

describe('Factory Type Safety', () => {
  it('buildUser produces valid UserEntity', () => {
    const user = buildUser().build()
    const validated: UserEntity = user  // Compile-time check
    expect(user).toBeDefined()
  })
})
```

### 4. Report Status

```markdown
## Factory Type Safety

✅ Type-Safe: 6/9 builders
❌ Needs Update: ThreadBuilder, MessageBuilder, UserCompanyBuilder

Without type safety: Domain adds field → tests pass → production breaks
With type safety: Domain adds field → compile error → fix required → safety
```

---

## Auto-Fix

For each unsafe builder:
1. Find domain type: `find app/features/{feature} -name "domain"`
2. Add import: `import type { Entity } from '@/app/features/{feature}/domain/{name}'`
3. Change `private data: { ... }` to `private data: Entity`
4. Add validation: `const initial: Entity = { ... }`
5. Return with satisfies: `return { ...this.data } satisfies Entity`

---

## Enterprise Impact

**Security**: Multi-tenant `companyId` required → compile error if missing
**Scalability**: Schema migrations auto-validated across all test data
**Production Grade**: Zero drift tolerance, compile-time guarantees

---

## References

- Factories: `app/testing/utils/factories.ts`
- Domain entities: `app/features/*/domain/*.ts`
- Pattern: `llm/rules/vitest.md` (factory builders section)