---
name: PR Creator
description: Auto-invoked when creating pull requests. Crafts engaging PR descriptions with executive summaries, silly ASCII art, and beautiful markdown formatting.
auto_trigger: true
keywords: [pull request, pr, create pr, open pr, pr description]
---

# PR Creator

**Mode**: Executive PR Composer - Creates high-impact, delightful pull request descriptions

## Core Principles

**Executive summary first** - Busy leaders need the why before the what
**Fun & professional** - Silly ASCII art with serious content
**Scannable** - Beautiful markdown, clear sections, visual hierarchy
**High value** - Every word earns its place
**Context over code** - Business impact over technical details

## Workflow

### Analyze Changes

**Understand the diff:**
```bash
# Get commit history since branch diverged
git log master..HEAD --oneline

# Full diff from base branch
git diff master...HEAD --stat

# Identify changed features
git diff master...HEAD --name-only | grep -E "^app/features" | cut -d/ -f3 | sort -u
```

**Extract context:**
- What problem does this solve?
- What features are added/changed?
- What's the business impact?
- Any breaking changes?
- What's the test coverage?

### Craft Title

**Format:** `type(scope): make it human and fun`

**Examples:**
```
✨ feat(billing): let users upgrade without leaving the page
🐛 fix(auth): stop login page from ghosting users
🎨 refactor(blog): make content flow like poetry
🧪 test(fixtures): add Steve McTestFace to the team
📚 docs(api): explain endpoints like you're explaining to your grandma
```

**Emoji guide:**
- ✨ New features
- 🐛 Bug fixes
- 🎨 UI/UX improvements
- ⚡ Performance
- 🔒 Security
- 🧪 Tests
- 📚 Documentation
- ♻️ Refactoring

### Generate ASCII Art

**CRITICAL: CREATE unique ASCII art for EVERY PR - Never reuse!**

**Generate fresh ASCII art based on PR context:**

**Method: Use creative ASCII patterns that match the PR theme**

**Examples of dynamic generation approaches:**

1. **For features** - Create celebratory characters:
   - Happy faces with varying expressions: `(^_^)`, `(◕‿◕)`, `ヽ(^o^)ノ`
   - Stars in different patterns: `✨ * ⭐ *`, `⭐ ✨ ⭐`, etc.
   - Rockets with variations: vertical vs diagonal orientation
   - Gift boxes: different ribbon styles

2. **For bugs** - Create fixing/building tools:
   - Hammers, wrenches in different positions
   - Squashed bug symbols
   - Checkmarks and crosses in unique patterns

3. **For performance** - Create speed/power symbols:
   - Lightning bolts in various strikes
   - Race cars from different angles
   - Speedometer variations
   - Arrows with different trajectories: `>>>`, `→→→`, `⇒⇒⇒`

4. **For security** - Create protection symbols:
   - Locks with different keyhole styles
   - Shields in various shapes
   - Safes with unique dial patterns

5. **For tests** - Create validation symbols:
   - Checkmarks with different styling
   - Test tubes in various fills
   - Magnifying glasses at different angles

**Creative Guidelines:**
- **Never copy-paste** - Generate new patterns each time
- **Use emojis creatively** - Mix and match different ones
- **Vary the structure** - Different heights, widths, alignments
- **Add unique text** - Change caption words: "READY", "SHIPPED", "DONE", "NICE", "STELLAR", "AMAZING", "PERFECT", etc.
- **Randomize spacing** - Different padding and centering
- **Mix symbols** - Combine ASCII chars: `/\`, `()`, `||`, `--`, `__`, etc.

**Example process:**
1. Identify PR type (feature/bug/perf/etc)
2. Choose theme elements (stars, rockets, etc)
3. Create unique layout (never seen before)
4. Add contextual emoji and text
5. Verify it's different from any previous PR

**Each PR MUST have genuinely unique art - be creative!**

### Write Executive Summary

**Template:**
```markdown
## 🎯 Executive Summary

**Impact:** [One sentence - what changes for users/business]

**Why now:** [One sentence - urgency or context]

**Confidence:** [High/Medium] - [Brief justification]
```

**Examples:**

```markdown
## 🎯 Executive Summary

**Impact:** Users can now upgrade their subscription in 2 clicks instead of navigating through 5 pages

**Why now:** 40% of upgrade attempts are abandoned due to friction

**Confidence:** High - Tested with 50 beta users, 95% completion rate
```

```markdown
## 🎯 Executive Summary

**Impact:** Blog post generation is now 3x faster, reducing API costs by 60%

**Why now:** Current response times causing user frustration and increased support tickets

**Confidence:** High - Performance tests show consistent 200ms response times
```

### Build Description Body

**Structure:**
```markdown
## 🎯 Executive Summary
[Impact, Why now, Confidence]

[ASCII ART]

## 💡 What Changed

**Added:**
- Feature X - [one-line benefit]
- Feature Y - [one-line benefit]

**Fixed:**
- Issue Z - [what users will notice]

**Improved:**
- Thing A - [measurable improvement]

## 🧪 Testing

- [x] Unit tests (N new tests)
- [x] Integration tests
- [x] Manual testing on [scenarios]
- [ ] Pending: [if any]

## 📊 Metrics

**Before → After:**
- Response time: 800ms → 250ms
- Test coverage: 75% → 92%
- Bundle size: No change

## 🚀 Deploy Notes

- [ ] No special deployment steps
- [ ] Run migrations: `pnpm db:migrate`
- [ ] Update env vars: [list]
```

**Keep it concise:**
- Executive summary: 3 lines max
- What changed: Bullets only, no paragraphs
- Testing: Checklist format
- Metrics: Numbers speak louder than words

### Format with Beautiful Markdown

**Visual hierarchy:**
```markdown
## 🎯 Section (h2 with emoji)

**Bold for emphasis**
- Bullets for lists
- Not paragraphs

```code blocks with syntax```

> Blockquotes for important callouts

---

Horizontal rules to separate major sections
```

**Anti-patterns:**

❌ **Walls of text:**
```markdown
This PR implements a new feature that allows users to do X and Y and also fixes Z. We needed this because A and B and C...
```

✅ **Scannable bullets:**
```markdown
**Added:**
- User feature X
- Admin feature Y

**Fixed:**
- Login flow issue Z
```

### Create PR and Open

**CRITICAL: Always create AND open the completed PR**

```bash
# Create PR and capture URL
PR_URL=$(gh pr create \
  --title "✨ feat(scope): human title" \
  --body "$(cat <<'EOF'
## 🎯 Summary

**Impact:** [impact]
**Why:** [urgency]
**Confidence:** [level]

[ASCII ART]

## What Changed
[changes]

## Testing
[tests]
EOF
)" 2>&1 | grep -oE 'https://github.com/.*/pull/[0-9]+')

# Open the completed PR in browser
open "$PR_URL"

# Return URL to user
echo "PR created and opened: $PR_URL"
```

**Must do:**
- Create PR with gh CLI
- Capture the final PR URL (not compare URL)
- Open completed PR in browser
- Return final URL to user

## PR Templates by Type

### Feature PR
```markdown
## 🎯 Executive Summary

**Impact:** Users can now [capability] with [benefit]
**Why now:** [Business reason or user pain point]
**Confidence:** High - [Test results or validation]

    ✨ NEW FEATURE ✨
       _________
      |  () ()  |
      |    ^    |
      |  \___/  |
       ---------

## 💡 What Changed

**Added:**
- [Feature] - [User benefit]
- [Feature] - [User benefit]

## 🧪 Testing

- [x] 15 new unit tests
- [x] Integration tests pass
- [x] Manual testing: [scenarios]

## 📊 Metrics

**Coverage:** 85% → 92%
**Performance:** No regression
```

### Bug Fix PR
```markdown
## 🎯 Executive Summary

**Impact:** Fixed [issue] affecting [X%] of users
**Why now:** [Severity or escalation]
**Confidence:** High - [How verified]

    🐛 BUG ELIMINATED 🐛
       ___
      /   \
     | X X |
      \___/
       |||
      FIXED!

## 💡 What Changed

**Fixed:**
- [Issue] - [What users will notice]
- [Issue] - [Root cause]

**Root Cause:**
[One sentence explanation]

## 🧪 Testing

- [x] Reproduces issue before fix
- [x] Regression tests added
- [x] Edge cases covered
```

### Performance PR
```markdown
## 🎯 Executive Summary

**Impact:** [Feature] is now [X]x faster
**Why now:** [Performance impact or cost]
**Confidence:** High - [Benchmark results]

    ⚡ PERFORMANCE BOOST ⚡
         _____
        | ⚡ ⚡ |
        |  ⚡  |
         -----
       ZOOM!

## 💡 What Changed

**Optimized:**
- [Component] - [Technique used]

## 📊 Metrics

**Before → After:**
- Response time: [X]ms → [Y]ms
- Memory usage: [X]MB → [Y]MB
- API calls: [X] → [Y]
```

## Anti-Patterns

❌ **Too long:**
```markdown
## Summary
This PR implements several changes including... [500 words]
```

❌ **No context:**
```markdown
## Changes
- Updated files
- Fixed stuff
```

❌ **Technical jargon:**
```markdown
Refactored the observer pattern implementation in the singleton factory...
```

❌ **No visual breaks:**
```markdown
We changed X and Y and Z and also fixed A and B...
```

✅ **Executive friendly:**
```markdown
## 🎯 Executive Summary
**Impact:** 3x faster page loads
**Why now:** Users complaining about speed
**Confidence:** High - tested extensively

## 💡 What Changed
**Optimized:**
- Image loading - lazy load below fold
- API calls - batch requests
```

## References

- Git commit history and diffs
- Project conventions for PR format
- Python random.choice() for ASCII art variation