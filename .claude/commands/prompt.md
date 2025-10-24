---
description: Create a prompt for a new agent to implement a feature, change, or fix.
---

The user input to you can be provided directly by the agent or as a command argument - you **MUST** consider it before
proceeding with the prompt (if not empty).

User input:

$ARGUMENTS

The text the user typed after `/prompt` in the triggering message **is** the feature description. Assume you always have
it available in this conversation even if `$ARGUMENTS` appears literally below. Do not ask the user to repeat it unless
they provided an empty command.

Given that feature description, do this:

- output a prompt for a new agent, assume they have no context of this change or codebase.
- assume they are an expert engineer, and they can figure it out just like you did.
- instruct the implementing agent to run `/7` before starting work
- **identify and explicitly list the 4-8 most relevant rule files** from `llm/rules/` for the task (e.g., "Focus on `api.md`, `db.md`, and `components.md`")
- use only necessary short examples, focus on what to do, not how to do it.
- be clearly concise and direct, use focused action words and communicate themes/goals.
- no fluff filler or duplication, prefer short explanations over long ones.
