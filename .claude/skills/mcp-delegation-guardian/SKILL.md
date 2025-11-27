---
name: mcp-delegation-guardian
description: Intercepts MCP calls, enforces SDK delegation (with Task fallback) to preserve context
version: 2.0.0
auto_trigger: true
keywords: [mcp__, supabase, vercel, playwright, chrome-devtools, n8n, serena, direct mcp, database, migration, sql, deployment, build logs, test automation, browser, performance, workflow, symbolic, refactor, edge function, branch, rls, policy, screenshot, navigate, execute_sql, list_tables, deploy, get_deployment, playwright_navigate, click, fill, find_symbol, rename_symbol]
---

# MCP Delegation Guardian

**Mode**: Context preservation enforcer - prevents direct MCP calls, mandates specialist delegation via SDK (with Task fallback)

## Core Principle

**Zero direct MCP usage** - All MCP operations MUST delegate to specialist subagents via SDK runner (falls back to Task tool) to preserve precious context window.

## SDK Integration

**Required setup for SDK delegation:**

Import SDK runner from `.claude/sdk/runner.ts`:
```typescript
import { runSDKAgent } from './.claude/sdk/runner';
```

SDK provides parallel execution, automatic retry, and efficient context management. Task tool serves as reliable fallback when SDK unavailable.

## Trigger Conditions

**Auto-invokes when detecting:**
- Any tool call starting with `mcp__`
- About to call MCP server tools directly
- Agent proposing direct MCP usage
- Missing Task tool delegation for MCP operations

**MCP servers to guard:**
- `mcp__supabase__*` → SDK: supabase | Fallback: supabase-specialist
- `mcp__vercel__*` → SDK: vercel | Fallback: vercel-specialist
- `mcp__playwright__*` → SDK: playwright | Fallback: playwright-specialist
- `mcp__chrome-devtools__*` → SDK: chrome-devtools | Fallback: chrome-devtools-specialist
- `mcp__n8n__*` → SDK: n8n | Fallback: n8n-specialist
- `mcp__serena__*` → SDK: serena | Fallback: serena-specialist

## Workflow

### Detect MCP Call Attempt

Monitor for:
- Tool calls with `mcp__` prefix
- Agent planning direct MCP usage in response
- Missing Task tool wrapper for MCP operations

### Intercept and Block

**STOP immediately before execution:**

"⚠️ **MCP Delegation Required**

Direct MCP calls waste context. Must delegate to specialist subagent."

### Redirect to Specialist (SDK-First)

**MCP routing table:**
```
mcp__supabase__* → SDK: supabase → Fallback: Task(supabase-specialist)
mcp__vercel__* → SDK: vercel → Fallback: Task(vercel-specialist)
mcp__playwright__* → SDK: playwright → Fallback: Task(playwright-specialist)
mcp__chrome-devtools__* → SDK: chrome-devtools → Fallback: Task(chrome-devtools-specialist)
mcp__n8n__* → SDK: n8n → Fallback: Task(n8n-specialist)
mcp__serena__* → SDK: serena → Fallback: Task(serena-specialist)
```

**SDK-first delegation pattern:**

```typescript
// ALWAYS try SDK first, fallback to Task
try {
  return await runSDKAgent('{sdk-agent-name}', `
    {Detailed task description with full context}

    Context: {relevant background information}
    Requirements: {specific requirements and constraints}
    Expected output: {what you need back}
  `);
} catch (sdkError) {
  // Automatic fallback to Task tool
  return Task({
    subagent_type: "{specialist-name}",
    description: "{3-5 word brief}",
    prompt: `{identical detailed task description from SDK attempt}`
  });
}
```

**Example - Supabase migration:**
```typescript
try {
  return await runSDKAgent('supabase', `
    Run migration to add user_preferences table.

    Context: New feature requires storing user settings
    Requirements: JSON column for settings, user_id FK, RLS policies
    Expected output: Migration file path and confirmation
  `);
} catch (error) {
  return Task({
    subagent_type: "supabase-specialist",
    description: "Create user preferences migration",
    prompt: `Run migration to add user_preferences table...`
  });
}
```

**Example - Vercel deployment check:**
```typescript
try {
  return await runSDKAgent('vercel', `
    Check latest deployment build logs for errors.

    Context: Recent push to feature branch
    Requirements: Full error stack if build failed
    Expected output: Build status and error details
  `);
} catch (error) {
  return Task({
    subagent_type: "vercel-specialist",
    description: "Check deployment build logs",
    prompt: `Check latest deployment build logs for errors...`
  });
}
```

**Example - Playwright test generation:**
```typescript
try {
  return await runSDKAgent('playwright', `
    Generate E2E test for login flow.

    Context: New OAuth provider added
    Requirements: Test both email and OAuth paths
    Expected output: Test file path and coverage report
  `);
} catch (error) {
  return Task({
    subagent_type: "playwright-specialist",
    description: "Generate login E2E test",
    prompt: `Generate E2E test for login flow...`
  });
}
```

### Educate Agent

**Explain SDK-first approach:**
- SDK enables parallel specialist execution
- Automatic retry and error handling
- Efficient context management
- Task tool provides reliable fallback
- Direct MCP calls waste main agent context
- Specialists have dedicated context windows

## Anti-Patterns

❌ Allowing direct MCP calls "just this once"
❌ Skipping SDK and going straight to Task
❌ Not catching SDK errors for fallback
❌ Partial delegation (some direct, some delegated)
❌ Ignoring auto-trigger keywords
❌ Agent bypassing with renamed tool calls

✅ Always try SDK first
✅ Graceful Task fallback on SDK failure
✅ 100% delegation enforcement
✅ Clear specialist routing
✅ Context preservation priority
✅ Zero exceptions to policy

## Specialist Capabilities

**supabase-specialist**: DB migrations, SQL, RLS policies, Edge Functions, advisors, branches, TS types

**vercel-specialist**: Deployments, build logs, projects, domains, preview URLs

**playwright-specialist**: Test automation, codegen, API testing, content extraction, PDF export

**chrome-devtools-specialist**: Performance profiling, CWV, CPU/network throttling, a11y snapshots

**n8n-specialist**: Workflow automation, templates, validation, webhook triggers, autofix

**serena-specialist**: Symbolic navigation, AST refactoring, semantic search, memory management

## Validation

Before allowing any MCP-related operation:
- ✅ SDK delegation attempted first
- ✅ Task tool fallback configured
- ✅ Correct specialist identified
- ✅ Detailed prompt with context provided
- ✅ No direct MCP tool calls in plan
- ✅ Context preservation maintained

## References

- `AGENTS.md:35-56` - MCP Delegation policy (MANDATORY)
- `.claude/sdk/runner.ts` - SDK agent runner implementation
- `.claude/agents/*-specialist.md` - Specialist capabilities