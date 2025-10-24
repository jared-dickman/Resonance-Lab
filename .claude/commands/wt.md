---
description: Initialize an isolated git worktree session for safe experimentation with guaranteed work preservation
---

## Worktree Workflow Command

You are managing a git worktree session. A **worktree** creates a separate physical directory linked to the same git repository, allowing isolated work on a separate branch while keeping the main directory clean.

### Startup Sequence

1. **Derive descriptive session name:**
   - Analyze the user's task/feature request
   - Create a short, kebab-case name (1-3 words) describing the feature
   - Examples:
     - "Add user management" → `user-management`
     - "Fix authentication bug" → `auth-fix`
     - "Update navbar styling" → `navbar-styling`
     - "Implement search feature" → `search-feature`

2. **Create named worktree:**

   ```bash
   SESSION_NAME="feature-name"  # Replace with descriptive name
   git worktree add ../BlogzillaV5-session-${SESSION_NAME} -b session/${SESSION_NAME}
   ```

3. **Explain to user:**
   - Worktree created at: `../BlogzillaV5-session-${SESSION_NAME}`
   - Branch: `session/${SESSION_NAME}`
   - All changes happen in worktree directory
   - Main directory stays on `master` branch
   - Git history is shared between both directories

4. **Verify and navigate:**

   ```bash
   git worktree list  # Confirm creation
   cd ../BlogzillaV5-session-${SESSION_NAME}
   ```

5. **Store worktree info for session:**
   - Remember the worktree path
   - Remember the session branch name
   - Use TodoWrite to track all work

### During Session

**All operations happen in the worktree directory:**

- File edits: Use worktree path for all Read/Write/Edit tools
- Commits: Go to session branch automatically
- **Commits: Make atomic commits frequently** (after each logical chunk, see Best Practices section below)
- Progress: Track with TodoWrite tool
- Remind user: "Working in worktree session branch"

### Best Practices During Active Work

#### 1. Atomic Commits Are Mandatory

Commit after each logical chunk of work. Never accumulate uncommitted changes across multiple tasks.

Examples: "update empty states", "improve error messages", "add form placeholders"

#### 2. Why This Matters

**⚠️ If a worktree directory is removed while uncommitted changes exist, ALL WORK IS LOST.**

Worktrees are temporary folders. Commits are permanent. Only committed work is safe.

Real scenario:

```
✗ Agent works 2 hours, makes 45+ changes, never commits
✗ Worktree directory disappears → all work lost
```

Don't rely on exit protocol as your only save point.

#### 3. When to Commit

Commit at any trigger (whichever comes first):

- After completing each todo item
- After modifying 3-5 related files
- Before switching to different work type
- **Minimum: Every 7 minutes**

If in doubt, commit.

#### 4. Commit Message Format

```bash
# ✓ Good:
git commit -m "feat: update app tagline for clarity"
git commit -m "feat: improve empty states across Ideas, Keywords, Blog pages"
git commit -m "fix: resolve TypeScript error in BlogDetailPage"

# ✗ Bad:
git commit -m "update copy"  # Too vague
git commit -m "wip"  # Not descriptive
```

Use format: `type: what you changed`
Types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`

#### 5. Example Workflow

```bash
# Start session for "copy improvements" feature
SESSION_NAME="copy-improvements"
git worktree add ../BlogzillaV5-session-${SESSION_NAME} -b session/${SESSION_NAME}
cd ../BlogzillaV5-session-${SESSION_NAME}

# Edit → Commit → Edit → Commit (repeat)
git add app/config/constants.ts
git commit -m "feat: update app tagline"

git add app/components/ideas/IdeasPage.tsx
git commit -m "feat: improve Ideas page empty states"

git add app/components/keywords/KeywordsPage.tsx
git commit -m "feat: improve Keywords page copy"

# Exit: merge all commits
git checkout master
git merge session/${SESSION_NAME}
git worktree remove ../BlogzillaV5-session-${SESSION_NAME}
git branch -d session/${SESSION_NAME}
```

Result: 3+ save points instead of 0.

#### 6. Quick Reference

```bash
git status                          # Check what needs committing
git add -A                          # Stage all changes
git commit -m "feat: description"   # Commit
git log --oneline -10               # View commit history
```

#### 7. Warning Signs - Commit Immediately If:

- ⚠️ 20+ file changes without a commit
- ⚠️ Can't remember what you changed an hour ago
- ⚠️ 10+ completed todos with no commits
- ⚠️ 30+ minutes with no commits

**Action:** STOP → `git add -A` → `git commit -m "feat: what you did"` → CONTINUE

#### 8. Key Insight

```
Worktree = temporary folder (can disappear)
Commits = permanent (always safe)
```

Uncommitted work is one filesystem error away from vanishing. Only committed work survives.

### Session Exit Protocol

**🚨 NEVER MERGE TO MASTER OR PUSH - USER MUST REVIEW FIRST**

When done:

1. **Commit remaining changes:**

   ```bash
   git add -A && git commit -m "feat: [description]"
   ```

2. **Run quality checks:**

   ```bash
   pnpm run typecheck  # Check types
   pnpm exec ast-grep scan  # Check violations
   ```

3. **Start dev server on random port:**

   ```bash
   PORT=$(node -e "require('http').createServer().listen(0, function() { console.log(this.address().port); this.close(); })")
   NEXT_PUBLIC_ENABLE_MSW=true PORT=$PORT pnpm dev
   ```

4. **Present summary:**

   ```
   ✅ Session complete - Review & test before merging!

   📦 Branch: session/${SESSION_NAME}
   🎯 Commits: [count] commits

   🌐 Dev server: http://localhost:[PORT]

   ✅ TypeScript: passing
   ✅ ast-grep: no violations

   🧪 Test your changes, then merge manually:
      git merge session/${SESSION_NAME}
      git push origin master
   ```

**NEVER auto-execute:** `git merge`, `git push`, or cleanup commands

### Session State Tracking

Store in memory throughout session:

- `WORKTREE_PATH`: Full path to worktree directory (e.g., `../BlogzillaV5-session-user-management`)
- `SESSION_BRANCH`: Branch name (e.g., `session/user-management`)
- `SESSION_NAME`: Descriptive name (e.g., `user-management`)
- `SESSION_ACTIVE`: Boolean flag
- `CHANGES_COMMITTED`: Boolean flag

Update these as work progresses. Check before allowing session end.

### Error Handling

**If worktree creation fails:**

- Check for existing worktrees: `git worktree list`
- Check for branch conflicts: `git branch -a`
- Suggest cleanup: `git worktree prune`

**If merge conflicts occur:**

- Show conflict files
- Guide user through resolution
- Don't auto-merge without confirmation

**If user tries to exit prematurely:**

- Show clear warning
- List uncommitted files
- Require explicit choice
- Never assume "discard"

### Success Criteria

✓ User understands worktree concept
✓ All file operations use worktree path
✓ Work is never lost due to premature exit
✓ Clear status updates throughout session
✓ Clean worktree removal after save
✓ No orphaned worktrees or branches
