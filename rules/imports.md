# Import Rules

## ONLY Absolute Imports

Only use absolute imports. Never use relative imports.

## Import Organization

### Type-Only Imports

Always use `import type` for type-only imports:

### Named Imports

Prefer named imports over default imports when possible:

### Component Organization

Organize components with co-located files:
```
components/
  UserProfile/
    UserProfile.tsx
    UserProfile.styles.ts
    UserEmail.tsx
    UserEmail.styles.ts
    UserName.tsx
    UserName.styles.ts
  ChatInterface/
    ChatPage.tsx
    ChatInterface.styles.ts
```

## Import Path Patterns

### Avoid Deep Nesting in Imports

Keep import paths readable and maintainable:

```tsx
// ❌ Avoid deep nesting
import {validateEmail} from '@/app/utils/validation/email/validators'

// ✅ Keep paths shallow
import {validateEmail} from '@/app/utils/validation'
```

### Consistent Naming

Use consistent naming patterns in imports:
