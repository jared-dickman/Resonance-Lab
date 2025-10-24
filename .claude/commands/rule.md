---
description: Create a new ast-grep linting rule with test cases
---

$ARGUMENTS

Create an ast-grep rule in `rules/[rule-name].yml`:

1. Define pattern matching logic (what to catch)
2. Add severity (error/warning)
3. Write clear violation message
4. Configure paths (include/exclude)
5. Add test cases to `scripts/test-ast-grep-rules.ts`:
   - violations[] - bad code that should fail
   - passes[] - good code that should pass

Run `npm run test:ast-grep-rules` to verify.
