# Git Commit Task

Create commits for session changes.

## Workflow

Analyze: Run `git status` and `git diff`. Review conversation history. Decide if changes need one commit or multiple logical commits.

Plan: Group related files. Prefer smaller commits. Write commit messages in imperative mood ("Add feature" not "Added feature"). Focus on why, not just what. Keep it concise and direct. No fluff or filler.

Present: Show which files go in each commit and the message. Ask to proceed.

Execute: Use `git add <specific-files>` (never `-A` or `.`). Commit. Show `git log --oneline -n [N]`.

## Rules

Never add Claude attribution or co-author info. Write commits as the user would. No "Generated with Claude" or "Co-Authored-By" lines. No other thoughts or commentary.


Never commit code with failing tests or linting errors!
Run tests for playwright, storybook, and linting before confirming commits with user. Surface any issues.  
