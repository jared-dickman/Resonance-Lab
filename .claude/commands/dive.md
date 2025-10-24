---
description: Vision discovery through iterative questioning - uncover clarity before building.
---

User input:

$ARGUMENTS

Goal: Extract vision clarity through targeted iterative questioning. Ask ONE question at a time, build on answers, decide when sufficient clarity achieved.

Execution:

1. Understand context
   - If $ARGUMENTS provided, use as initial vision/feature context
   - If empty, ask user for brief vision statement (<=2 sentences)

2. Question strategy
   - Ask EXACTLY ONE question per turn
   - Each builds on previous answers
   - Quality focus:
     - Uncover assumptions ("What makes this better than X?")
     - Explore why ("Why now vs later?")
     - Probe constraints ("What can't change?")
     - Define success ("How do we know it works?")
     - Find edge cases ("What breaks this?")
     - Examine trade-offs ("What are we sacrificing?")
     - Clarify impact ("Who benefits most?")
   - Format: Short, direct, thought-provoking
   - NO multiple choice unless critical for disambiguation

3. Answer processing
   - After each answer, decide internally:
     - Is clarity sufficient? (functional scope + constraints + success criteria clear)
     - What's the most valuable next question?
   - Track answers in memory (DO NOT write files during questioning)
   - Continue until clarity threshold met (typically 4-8 questions)

4. Termination triggers
   - Agent recognizes sufficient clarity, OR
   - User signals done ("that's it", "good", "proceed"), OR
   - Diminishing returns detected (answers no longer revealing critical info)

5. Final output (exec summary style)

   Vision Summary:
   - Core goal: <1 sentence>
   - Key constraints: <2-3 bullets>
   - Success criteria: <2-3 bullets>

   What We Might Still Be Missing:
   - <Potential gap 1>
   - <Potential gap 2>
   - <Potential gap 3>

   Suggested next: [/specify | /plan | continue conversation]

Rules:

- ONE question at a time, no exceptions
- Never list future questions
- No files written during session
- If vision fundamentally unclear after 8 questions, flag and recommend specification workshop
- Output style: short, concise, direct - executive level
- Trust your judgment on when clarity achieved
