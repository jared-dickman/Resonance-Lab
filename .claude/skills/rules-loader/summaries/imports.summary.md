# Import Rules

## Core Pattern
Absolute imports only. Shallow paths. Type-only imports. Named over default.

## Key Requirements
- **Absolute only:** Never use relative imports (`../`)
- **Type-only:** `import type {User} from '@/types'` for types
- **Named imports:** Prefer named over default when possible
- **Shallow paths:** Avoid deep nesting in import paths

## Code Examples

**Type-only imports:**
```tsx
import type {User, Company} from '@/app/features/users/types'
import {getUser} from '@/app/features/users/service'
```

**Shallow vs deep paths:**
```tsx
// ❌ Avoid deep nesting
import {validateEmail} from '@/app/utils/validation/email/validators'

// ✅ Keep paths shallow
import {validateEmail} from '@/app/utils/validation'
```

## Component Organization
Co-locate related components:
```
components/
  UserProfile/
    UserProfile.tsx
    UserEmail.tsx
    UserName.tsx
  ChatInterface/
    ChatPage.tsx
```

## Anti-Patterns
- ❌ Relative imports: `import {foo} from '../utils'`
- ❌ Mixed type imports: `import {User, getUser} from '@/types'`
- ❌ Deep paths: `@/app/utils/validation/email/validators`
- ❌ Default when named available

## Validation
- [ ] All imports use absolute paths (`@/`)
- [ ] Types use `import type`
- [ ] Import paths are 3 levels or less
- [ ] Using named imports where available

## Read Full File If
File is minimal. Reference for any import organization questions.