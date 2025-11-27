---
name: symbolic-read-guardian
description: Enforces symbolic exploration before full file reads to preserve context
auto_trigger: true
keywords: [read file, read the, check implementation, see what's in, look at, examine, inspect, review file, full file, entire file, whole file, code in, implementation of, how does, what does, understand, explore, investigate, analyze code, read code, view file, check file, scan file, ts file, tsx file, py file, js file, class definition, function definition, method implementation, component code]
---

# Symbolic Read Guardian

**Mission:** Preserve context by enforcing symbolic code exploration before full file reads. Prevents token waste from unnecessary large file reads.

## Core Principle

**Symbolic-first exploration** - Always use LSP/AST-based tools (`get_symbols_overview`, `find_symbol`) to understand code structure before reading entire files.

## Trigger Conditions

**Auto-invokes when detecting:**
- Read tool calls on code files (`.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.go`, `.java`, `.rb`, `.php`, `.cs`) >200 lines
- Phrases: "read the file", "check the implementation", "see what's in", "look at the code"
- Multiple sequential Read calls without prior symbolic exploration
- Agent planning to read full code files directly
- Attempting to understand code structure through full file reads

**Exception cases (allow direct Read):**
- Config files (`.json`, `.yaml`, `.yml`, `.toml`, `.env.example`)
- Documentation (`.md`, `.txt`)
- Small files (<200 lines)
- Non-code assets (`.css`, `.html`, `.svg`)
- After symbolic tools already used
- When symbolic tools failed or unavailable

## Workflow

### Detect Read Attempt

Monitor for:
- Read tool call on code file path
- Agent mentioning reading/examining code files
- Planning to "check what's in" a file
- Sequential reads without symbolic exploration

### Check Symbolic Exploration

**Verify agent has first:**
1. Used `get_symbols_overview` on target file
2. Used `find_symbol` to locate specific symbols
3. Used `find_referencing_symbols` if exploring relationships

**If not done:**
- Check file extension (code file?)
- Estimate file size (>200 lines?)
- Confirm no prior symbolic exploration

### Intercept and Redirect

**BLOCK if:**
- Code file AND >200 lines AND no symbolic exploration

**Provide guidance:**
```
⚠️ **Symbolic Exploration Required**

Reading full files wastes context. Use symbolic tools first:

1. get_symbols_overview("{file_path}")
   → See all top-level symbols (classes, functions, exports)

2. find_symbol(name_path="{symbol}", relative_path="{file_path}", include_body=true)
   → Read specific symbol bodies only

3. find_referencing_symbols(name_path="{symbol}", relative_path="{file_path}")
   → Understand symbol relationships

Only read full file if:
- Symbolic tools insufficient
- Need to see full context
- File is config/docs/small
```

### Allow Read

**Permit when:**
- Symbolic tools already used
- File <200 lines
- Non-code file type
- Config/documentation
- Agent explicitly explains why full read needed

## Token Impact

**Without symbolic tools:**
- Reading 500-line file = ~1500 tokens
- Reading 10 files = ~15,000 tokens wasted

**With symbolic tools:**
- Overview = ~50 tokens
- Targeted symbol reads = ~200 tokens per symbol
- Reading only what's needed = 90% token savings

## Symbolic Tool Patterns

**Pattern 1: Class exploration**
```typescript
// First: Overview
get_symbols_overview("src/services/billing.ts")
// Returns: class BillingService, class SubscriptionManager, function calculateTax

// Then: Targeted read
find_symbol(name_path="BillingService", relative_path="src/services/billing.ts", depth=1, include_body=false)
// Returns: Method names only

// Finally: Specific method
find_symbol(name_path="BillingService/processPayment", relative_path="src/services/billing.ts", include_body=true)
```

**Pattern 2: Function discovery**
```typescript
// Search for function
find_symbol(name_path="validateEmail", substring_matching=true, include_body=true)
// Returns: All validateEmail functions across codebase

// Find usage
find_referencing_symbols(name_path="validateEmail", relative_path="src/utils/validation.ts")
```

**Pattern 3: Component understanding**
```typescript
// Overview first
get_symbols_overview("src/components/UserProfile.tsx")

// Then specific exports
find_symbol(name_path="/UserProfile", relative_path="src/components/UserProfile.tsx", include_body=true)
```

## Anti-Patterns

❌ Reading entire file to find one function
❌ Sequential file reads without symbolic exploration
❌ "Let me check what's in this file" → immediate Read
❌ Bypassing symbolic tools for "small" 300-line files
❌ Reading files to understand architecture

✅ Overview first, targeted reads second
✅ Symbolic navigation for code exploration
✅ Full reads only when necessary
✅ Exception awareness (configs, docs, small files)
✅ Explaining when full read is needed

## Enforcement Logic

```typescript
function shouldBlockRead(filePath: string, hasSymbolicExploration: boolean): boolean {
  // Allow non-code files
  if (isConfigOrDoc(filePath)) return false

  // Allow if symbolic tools already used
  if (hasSymbolicExploration) return false

  // Allow small files
  if (estimatedLines < 200) return false

  // Block large code files without symbolic exploration
  return isCodeFile(filePath) && estimatedLines >= 200
}

function isCodeFile(path: string): boolean {
  const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.java', '.rb', '.php', '.cs']
  return codeExtensions.some(ext => path.endsWith(ext))
}

function isConfigOrDoc(path: string): boolean {
  const allowedExtensions = ['.json', '.yaml', '.yml', '.toml', '.md', '.txt', '.env.example', '.css', '.html', '.svg']
  return allowedExtensions.some(ext => path.endsWith(ext))
}
```

## Validation

Before allowing Read on code file:
- ✅ Symbolic exploration attempted first OR
- ✅ File <200 lines OR
- ✅ Non-code file (config/docs) OR
- ✅ Agent justified why full read needed

## Impact Metrics

**Track:**
- Files explored symbolically vs read fully
- Token savings (estimated)
- Time to find target code
- False positive blocks (agent needed full read)

**Success criteria:**
- 80%+ code explorations use symbolic tools first
- 50%+ reduction in full file reads
- Minimal false positive blocks

## References

- `mcp__serena__*` tools - Symbolic code navigation capabilities
- `.claude/agents/serena-specialist.md` - Serena MCP specialist for delegation
- LSP/AST patterns - Modern IDE symbolic navigation