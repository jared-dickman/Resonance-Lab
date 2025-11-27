---
name: rules-loader
description: Two-phase rule loader. Phase 1 reads summaries (~50 lines), Phase 2 reads critical full files (max 12). Returns verbatim excerpts. Deterministic.
auto_trigger: true
keywords: [create, implement, feature, test, refactor, component, api, migration, fix, rule, pattern, standard, code, change, update, db, test, write, prime, begin, start ]
---

# Rules Loader

Delegates to rules-loader-agent to load project rules efficiently while preserving main agent's context.

---

## Workflow

**Step 1: Gather task context**

From the conversation, identify:
- What is being built/fixed (task_description)
- Task category if obvious: feature_api, testing_e2e, testing_unit, testing_component, component_ui, migration_db, refactor, security, analytics
- Specific technologies mentioned: Stripe, auth, TanStack Query, etc.

**Step 2: Delegate to agent**

ACTION REQUIRED: Invoke Task tool
- subagent_type: "general-purpose"
- model: "haiku"
- description: "Load project rules"
- prompt: Read and execute `.claude/agents/rules-loader-agent.md` with the following input:

  INPUT:
  - task_description: "{what user is building/fixing}"
  - task_category: "{category if known, otherwise omit}"
  - specific_technologies: "{list if known, otherwise omit}"

  Follow the agent workflow exactly. Return all loaded rule content verbatim.

Wait for rules to be loaded.

**Step 3: Present rules to main agent**

The loaded rules are now available in context. Proceed with the task using these rules as guidance.

---

## Task Categories

Quick reference for identifying category:
- API/feature work → `feature_api`
- E2E/Playwright tests → `testing_e2e`
- Unit/Vitest tests → `testing_unit`
- Storybook/component tests → `testing_component`
- UI components → `component_ui`
- Database migrations → `migration_db`
- Code refactoring → `refactor`
- Security/auth → `security`
- Analytics/tracking → `analytics`

---

## Benefits

**Context preservation:**
- Main agent stays lean 
- Rules loaded in isolated subagent
- Only relevant rules returned
- Same input = same output (deterministic)

**Token efficiency:**
- Summaries first (~50 lines each)
- Critical full files only (max 12)
- Targeted loading based on task