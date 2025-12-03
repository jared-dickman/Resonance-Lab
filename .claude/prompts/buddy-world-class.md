# Buddy Agent: World-Class Implementation Plan

> **Current Grade: C-** → **Target: A+**
>
> Streaming endpoint exists but is orphaned, unsecured, and missing enterprise patterns.

---

## Phase 1: Security Foundation

**Goal:** Production-safe API that won't leak credits or accept attacks

**Rules:** `security.md`, `nextjs.md`, `zod-patterns.md`

### Agent Checklist

- [ ] Add `requireAuthForRoute()` to `/api/buddy-stream/route.ts`
- [ ] Create Zod schema for `RequestBody` with message length limits
- [ ] Add rate limiter (20 req/hour/user)
- [ ] Validate navigation paths against allowlist
- [ ] Return 404 not 403 for auth failures (per security.md)

**Spawn command:**
```
Implement Phase 1 security for /frontend/app/api/buddy-stream/route.ts
Run /7 first. Focus: security.md, nextjs.md, zod-patterns.md
ultrathink each step
```

---

## Phase 2: Wire Up Streaming

**Goal:** Client receives real-time SSE tokens from Buddy

**Rules:** `code-standards.md`, `tanstack-query.md`

### Agent Checklist

- [ ] Update `useBuddyChat.ts` to call `/api/buddy-stream`
- [ ] Parse SSE events: `start`, `text`, `tool_start`, `tool_result`, `complete`, `error`
- [ ] Stream tokens to UI as they arrive
- [ ] Handle connection drops gracefully
- [ ] Show tool execution status in UI

**Spawn command:**
```
Wire /api/buddy-stream SSE to useBuddyChat.ts client hook
Run /7 first. Focus: code-standards.md, tanstack-query.md
ultrathink each step
```

---

## Phase 3: Model & Cost Optimization

**Goal:** 90% cost reduction via caching, better responses via Sonnet 4.5

**Rules:** `environment.md`, `logging.md`

### Agent Checklist

- [ ] Upgrade model to `claude-sonnet-4-5-20250929`
- [ ] Enable prompt caching with `cache_control: { type: 'ephemeral' }`
- [ ] Increase `MAX_TOKENS` to 8192 for complex tool responses
- [ ] Add usage cost calculation to response
- [ ] Track per-user token consumption

**Spawn command:**
```
Optimize Buddy model config: Sonnet 4.5 + prompt caching + usage tracking
Run /7 first. Focus: environment.md, logging.md
ultrathink each step
```

---

## Phase 4: Reliability & Error Handling

**Goal:** Graceful recovery, no silent failures

**Rules:** `code-standards.md`, `logging.md`

### Agent Checklist

- [ ] Add exponential backoff retry (3 attempts)
- [ ] Implement circuit breaker for downstream failures
- [ ] Return partial results if some tools succeed
- [ ] Classify errors: retryable vs terminal
- [ ] Log all failures with context via `serverErrorTracker`

**Spawn command:**
```
Add enterprise error handling to buddy-stream: retry, circuit breaker, partial success
Run /7 first. Focus: code-standards.md, logging.md
ultrathink each step
```

---

## Phase 5: Smart Tool Execution

**Goal:** Tools run in optimal order with dependency awareness

**Rules:** `code-standards.md`

### Agent Checklist

- [ ] Build tool dependency graph: `search → download`, `list_artists → get_artist_songs`
- [ ] Execute independent tools in parallel
- [ ] Execute dependent tools sequentially
- [ ] Add tool execution timing metrics
- [ ] Validate tool outputs before passing to Claude

**Spawn command:**
```
Implement dependency-aware tool execution in buddy-stream
Run /7 first. Focus: code-standards.md
ultrathink each step
```

---

## Phase 6: Observability

**Goal:** Debug production issues, track agent performance

**Rules:** `logging.md`, `analytics.md`

### Agent Checklist

- [ ] Add agent tracing (span per tool call)
- [ ] Track success rate, latency, token usage per session
- [ ] Log conversation summaries for debugging
- [ ] Add health check endpoint
- [ ] Dashboard metrics: cost/user, tools/session, error rate

**Spawn command:**
```
Add observability to Buddy: tracing, metrics, health check
Run /7 first. Focus: logging.md, analytics.md
ultrathink each step
```

---

## Verification Matrix

| Phase | Test | Pass Criteria |
|-------|------|---------------|
| 1 | `curl -X POST /api/buddy-stream` (no auth) | Returns 401/404 |
| 1 | Send 10KB message | Returns 400 validation error |
| 2 | Send "find me a song" | SSE tokens stream to UI |
| 3 | Check Anthropic dashboard | Cache hit rate > 80% |
| 4 | Kill backend mid-request | Client shows graceful error |
| 5 | Request search + download | Tools execute in order |
| 6 | Check logs after session | Full trace visible |

---

## File Reference

| File | Purpose |
|------|---------|
| `/frontend/app/api/buddy-stream/route.ts` | Streaming agent endpoint |
| `/frontend/app/api/core-buddy/route.ts` | Legacy endpoint (deprecate after migration) |
| `/frontend/lib/hooks/useBuddyChat.ts` | Client hook (needs SSE support) |
| `/frontend/lib/agents/buddy/` | Tools, prompts, executors |

---

## Success Metrics

- **Security:** 0 unauthenticated requests succeed
- **Performance:** P95 latency < 2s for first token
- **Cost:** 90% reduction via prompt caching
- **Reliability:** 99.5% success rate
- **UX:** Real-time token streaming to UI
