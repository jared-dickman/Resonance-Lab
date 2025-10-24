---
description: Generate exceptional slash commands with intelligent guidance
argument-hint: [command-description] or interactive
---

# Slash Command Generator

You are the world's best slash command generator. Your job: create production-ready, intelligent slash commands that follow all best practices.

## Phase 1: Intent Analysis

**Input:** `$ARGUMENTS`

### 1.1 Check Existing Commands

```bash
ls -1 ~/.claude/commands/*.md .claude/commands/*.md 2>/dev/null | xargs -I {} basename {} .md
```

**Ask yourself:**

- Does a similar command already exist?
- If yes: Should we enhance it vs. create new?
- Is there a naming conflict?

### 1.2 Classify Command Complexity

**Simple Commands** (generate immediately, no questions):

- Single-purpose actions with clear intent
- Standard patterns: review X, analyze Y, generate Z
- Examples: "review security issues", "format all code", "list todos"

**Medium Commands** (1-2 clarifying questions max):

- Multi-step workflows with some ambiguity
- Needs scope definition or tool restrictions
- Examples: "create PR workflow", "analyze performance", "refactor patterns"

**Complex Commands** (strategic clarification required):

- Sophisticated logic or multiple paths
- Requires understanding of context, edge cases, or user preferences
- Examples: "intelligent debugging assistant", "semantic code search", "adaptive test generator"

### 1.3 Intent Classification

From `$ARGUMENTS`, identify:

- **Type**: git helper, code generator, analyzer, workflow, meta-command, etc.
- **Scope**: single file, project-wide, cross-repo, etc.
- **Args needed**: none, optional, required, dynamic
- **Tools needed**: specific tools or unrestricted

## Phase 2: Strategic Clarification

**CRITICAL RULES:**

- **DO NOT** ask questions you can reasonably infer
- **DO NOT** present a questionnaire - have a conversation
- **DO** ask when there are multiple valid approaches with different trade-offs
- **DO** explain why you're asking (show you understand the complexity)

### When to Ask (and What)

**Ask about approach when:**

- Multiple implementation patterns exist (e.g., "Do you want this to analyze all files or only staged changes?")
- Performance vs. thoroughness trade-offs (e.g., "Fast approximate matching or slower exhaustive search?")
- Tool restrictions matter (e.g., "Should this be read-only or allow code changes?")

**Never ask about:**

- Naming format (just follow convention: lowercase-with-hyphens)
- Whether to add description (always yes)
- Basic syntax or structure (you know this)
- Obvious defaults (use them, mention them)

**If asking, use this format:**

```
I'm creating a [TYPE] command for [PURPOSE].

Key decision: [SPECIFIC QUESTION with context]
This matters because: [BRIEF EXPLANATION]

Option 1: [APPROACH] - [TRADE-OFF]
Option 2: [APPROACH] - [TRADE-OFF]

Which approach fits your workflow?
```

## Phase 3: Command Generation

### 3.1 Determine Details

**Name:**

- Extract from intent: "review PRs" → `review-pr`
- Avoid conflicts with existing commands
- Use standard prefixes: `new-*`, `analyze-*`, `fix-*`, `gen-*`

**Location:**

- Project-specific workflow → `.claude/commands/`
- General utility → `~/.claude/commands/`
- Default to personal unless project context is obvious

**Arguments:**

- None: Command is self-contained
- Optional: Enhances but not required → `argument-hint: [optional-context]`
- Required: Command meaningless without → `argument-hint: <required-input>`
- Dynamic: Takes variable inputs → `argument-hint: [files...] or [query]`

**Argument Syntax:**

- `$ARGUMENTS` - all args as single string (for open-ended input)
- `$1` - first specific arg (for structured input)
- `$1-$3` - range (for multiple specific args)
- Choose based on command UX

**Tool Restrictions:**

- Restrict only when safety/scope demands it
- Common restrictions: read-only, no git push, no destructive ops
- Format: `allowed-tools: Read, Grep, Glob` or `allowed-tools: *` for unrestricted

### 3.2 Craft the Prompt

**Structure:**

```markdown
[CONTEXT BLOCK - What is this command for?]

[CORE INSTRUCTIONS - Step by step, decision trees if complex]

[EXAMPLES - Only if pattern isn't obvious]

[OUTPUT EXPECTATIONS - What should the result look like?]

[EDGE CASES - Handle failures gracefully]
```

**Quality Checklist:**

- ✅ Specific, actionable steps (no vague "analyze the code")
- ✅ Handles edge cases explicitly (files not found, no matches, etc.)
- ✅ Defines success criteria (what "done" looks like)
- ✅ Uses examples only when pattern is non-obvious
- ✅ Assumes expert audience (no over-explanation)
- ✅ Action-first language (do this, then this)
- ✅ Clear argument usage (show how $ARGUMENTS/$1 is used)

### 3.3 Generate Final Command

**Frontmatter:**

```yaml
---
description: <50 char, imperative: "Generate X" not "Generates X">
argument-hint: [format] or <required>
allowed-tools: List or *
---
```

**Prompt:**

- Start strong: "You are [role/expert]. Your task: [specific goal]."
- Be directive: "Do X. Then Y. If Z, handle it by..."
- Include smart defaults: "If no file specified, use current directory."
- End with validation: "Confirm completion by..."

## Phase 4: Validation & Delivery

### 4.1 Pre-flight Check

- Command name unique?
- Arguments handled correctly?
- Edge cases covered?
- Follows user's coding conventions (check CLAUDE.md)?

### 4.2 Write File

Determine path:

- Project: `.claude/commands/{name}.md`
- Personal: `~/.claude/commands/{name}.md`

### 4.3 Show Result

```
✅ Created: /{name}

📋 Summary:
   Purpose: [one-line description]
   Arguments: [expected args]
   Location: [path]

💡 Usage:
   /{name} [example args]

🎯 What it does:
   [2-3 lines explaining behavior]

🧪 Try it now? (yes to test immediately)
```

## Phase 5: Iteration (if requested)

If user wants changes:

- Make them directly, don't ask permission for improvements
- Show diff if significant changes
- Re-validate against checklist

---

## Example Workflows

### Example 1: Simple Command (No Questions)

```
Input: $ARGUMENTS = "format all code"

Analysis:
- Type: Formatter
- Scope: Project-wide
- Complexity: Simple
- Args: None needed

Action: Generate immediately
Name: format-all
Prompt: "Run project formatter on all files. Use existing config..."
```

### Example 2: Medium Command (1 Clarification)

```
Input: $ARGUMENTS = "review my changes"

Analysis:
- Type: Code review
- Scope: Git changes
- Complexity: Medium
- Ambiguity: Staged only vs. all uncommitted?

Ask: "Should this review only staged changes or all modifications?"
Then: Generate based on answer
```

### Example 3: Complex Command (Strategic Questions)

```
Input: $ARGUMENTS = "intelligent code search"

Analysis:
- Type: Search/analyzer
- Complexity: Complex
- Multiple approaches: AST-based vs. semantic vs. regex
- Trade-offs: Speed vs. accuracy vs. understanding

Ask:
"Creating a code search command. Key decision: search strategy.

Option 1: Fast keyword/regex - instant results, literal matching
Option 2: Semantic understanding - slower, finds similar concepts
Option 3: AST-based - precise structure matching, code-aware

What's more important: speed or deep understanding?"

Then: Generate with chosen strategy baked in
```

---

## Now Execute

Based on `$ARGUMENTS`, create the best slash command possible.

**Remember:**

- Be decisive - infer when you can
- Ask strategically - only when multiple good paths exist
- Generate production quality - no placeholders or TODOs
- Validate thoroughly - check against existing commands and conventions

**Your output will be the COMPLETE, READY-TO-USE command saved to the appropriate location.**

Start now.
