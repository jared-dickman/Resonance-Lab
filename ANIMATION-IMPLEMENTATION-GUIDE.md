# Animation System - Resonance Lab

## UX-Driven Motion Design Specification

**Purpose:** Create spatial awareness, guide attention, and provide feedback through purposeful motion.

**Stack:** Framer Motion + centralized timing constants

---

## Design Philosophy

Motion exists to serve users, not impress them:

- **Confirm actions** - User knows their tap registered
- **Show relationships** - Connected elements move together
- **Guide attention** - Important changes stand out
- **Reduce perceived wait** - Loading feels faster with motion
- **Never block** - Animations never delay user actions

---

## Timing Hierarchy

Speed communicates importance and urgency:

| Duration  | Purpose          | User Feeling          |
| --------- | ---------------- | --------------------- |
| **0.2s**  | Instant feedback | Responsive, snappy    |
| **0.3s**  | UI state changes | Quick, efficient      |
| **0.5s**  | Page transitions | Smooth, natural       |
| **0.8s**  | Emphasis moments | Important, deliberate |
| **1.5s+** | Ambient loops    | Calm, decorative      |

**Rule:** Faster = more urgent. Slower = more important.

---

## Pattern Library by User Need

### 1. "Did my action work?"

**Feedback Animations**

**What:** Buttons scale down on tap, icons rotate on click
**Why:** Confirms the interface received input
**Timing:** 0.2-0.3s (instant)
**Example:** Delete button rotates 90° and shrinks when tapped

---

### 2. "What changed?"

**State Transition Animations**

**What:** Icons swap with rotation, toggles slide backgrounds
**Why:** Shows before/after relationship clearly
**Timing:** 0.2s for swaps, 0.3s for slides
**Example:** Play/pause icon rotates in/out instead of popping

---

### 3. "Where did it go?"

**Exit Animations**

**What:** Items fade + shrink when removed
**Why:** Shows item left the list (not a bug)
**Timing:** 0.3s
**Example:** Deleted card shrinks to 95% scale while fading

---

### 4. "What's related?"

**Staggered Entry**

**What:** Grid items appear sequentially, not all at once
**Why:** Shows items are individual, guides reading order
**Timing:** 0.08s delay between items
**Example:** Chord cards enter one-by-one, top to bottom

---

### 5. "What's happening?"

**Loading States**

**What:** Pulsing dots, animated indicators
**Why:** Reduces anxiety during waits
**Timing:** 0.6s pulse cycle
**Example:** Three dots bounce while AI generates response

---

### 6. "What should I notice?"

**Emphasis Animations**

**What:** Glowing borders, pulsing highlights on active items
**Why:** Draws eye to current state
**Timing:** 1.5s infinite pulse
**Example:** Playing chord glows while audio plays

---

### 7. "How do I navigate?"

**Spatial Orientation**

**What:** Panels slide in from direction they appear
**Why:** Shows spatial relationship in layout
**Timing:** 0.5s with stagger (0.1s, 0.2s, 0.3s delays)
**Example:** Left panel enters from left, center from below, right from right

---

### 8. "Is this interactive?"

**Hover Affordances**

**What:** Cards lift (-4px), buttons scale up (105%)
**Why:** Signals clickability before click
**Timing:** Follows cursor instantly
**Example:** Chord cards lift on hover, showing they're tappable

---

### 9. "What's the current value?"

**Value Change Indicators**

**What:** Numbers pulse/highlight when changing
**Why:** Confirms change was applied
**Timing:** 0.3s pulse
**Example:** BPM counter briefly scales 105% when changed

---

### 10. "Where am I?"

**Ambient Context**

**What:** Subtle icon loops, decorative motion
**Why:** Adds personality without distraction
**Timing:** 2-2.5s loop with 3-4s pause
**Example:** Magic wand wiggles every 6 seconds

---

## Motion Principles

### Natural Physics

Use spring animations (stiffness: 300, damping: 24) for physical objects like cards.
Makes motion feel grounded and believable.

### Anticipation

Elements move slightly before main action (e.g., scale 0.98 before 1.05).
Prepares user for what's coming.

### Layered Timing

Never animate everything at once - stagger by importance.
Headers first (0.1s), then content (0.2s), then actions (0.3s).

### Exit Intent

Items leaving should hint where they're going.
Deleting? Shrink and fade. Dismissed? Slide off-screen.

---

## Anti-Patterns (Don't Do This)

**❌ Animate for the sake of it**

- Decorative motion that serves no purpose
- Fix: Remove or make it communicate something

**❌ Block user actions**

- Wait for animation to finish before allowing next click
- Fix: Make animations non-blocking (max 0.3s)

**❌ Animate everything at once**

- All 20 cards fade in simultaneously
- Fix: Stagger by 0.08s to show relationships

**❌ Inconsistent timing**

- Buttons use 0.2s sometimes, 0.5s other times
- Fix: Use centralized constants

**❌ Overshoot springs**

- Elements bounce too much (looks buggy)
- Fix: Use damping: 30 for tight springs

---

## Implementation Constants

Create `lib/constants/animation.constants.ts`:

```typescript
export const DURATION = {
  INSTANT: 0.2, // Feedback
  FAST: 0.3, // State changes
  NORMAL: 0.5, // Transitions
  EMPHASIS: 0.8, // Important moments
};

export const SPRING = {
  TIGHT: { stiffness: 500, damping: 30 }, // Snappy
  DEFAULT: { stiffness: 300, damping: 24 }, // Balanced
  LOOSE: { stiffness: 200, damping: 20 }, // Bouncy
};

export const STAGGER = 0.08; // Grid items
export const CASCADE = 0.1; // Sequential panels
```

**Why constants?**

- Consistency across the app
- Easy to tune globally
- Self-documenting code

---

## Gesture Interactions

| Gesture          | Response            | Why                              |
| ---------------- | ------------------- | -------------------------------- |
| **Hover card**   | Lift 4px            | Signals interactivity            |
| **Hover button** | Scale 105%          | Confirms target                  |
| **Tap button**   | Scale 95%           | Confirms press received          |
| **Tap card**     | Scale 98%           | Softer feedback (less intrusive) |
| **Hover delete** | Rotate + scale 120% | Warning (destructive action)     |

---

## Accessibility

**Respect `prefers-reduced-motion`:**

- Disable decorative animations
- Keep functional feedback (button press)
- Reduce durations to 0.1s max

**Why:** Motion sickness, vestibular disorders, cognitive load.

---

## Performance Rules

1. **Animate transforms only** - x, y, scale, rotate (GPU accelerated)
2. **Avoid layout animations** - width, height, margin (causes reflow)
3. **Use will-change sparingly** - Only for known-intensive animations
4. **Limit simultaneous animations** - Max 10-15 elements moving at once

**Why:** Smooth 60fps > fancy effects that jank.

---

## When to Animate

| Scenario           | Animate?  | Rationale               |
| ------------------ | --------- | ----------------------- |
| User clicks button | ✅ Yes    | Confirm action received |
| Loading new data   | ✅ Yes    | Reduce perceived wait   |
| Background sync    | ❌ No     | Don't interrupt user    |
| Error state        | ⚠️ Subtle | Alert without scaring   |
| Success state      | ✅ Yes    | Celebrate wins          |
| Passive updates    | ❌ No     | Don't steal attention   |

---

## Testing Checklist

- [ ] All animations < 1s (except intentional ambiance)
- [ ] No jank on low-end devices
- [ ] Respects prefers-reduced-motion
- [ ] User can skip/cancel long animations
- [ ] Animations don't block interactions
- [ ] Consistent timing across similar actions

---

## Quick Reference

**"User clicked something"** → 0.2s tap scale
**"Data loaded"** → 0.5s fade in with 0.08s stagger
**"Item deleted"** → 0.3s fade + shrink exit
**"Important change"** → 0.8s with 1.5s pulse
**"Panel navigation"** → 0.5s slide from direction
**"Playing audio"** → 1.5s infinite glow

**Default:** If unsure, use 0.3s duration with default spring.

---

## Example Decision Tree

```
Need animation? → Ask "Does this help the user?"
├─ Yes: Proceed
└─ No: Remove it

What's the goal?
├─ Confirm action → 0.2s feedback
├─ Show change → 0.3s transition
├─ Guide attention → 0.5s with stagger
└─ Emphasize → 0.8s + pulse

Multiple items?
├─ Related → Stagger 0.08s
├─ Sequential → Cascade 0.1s each
└─ Independent → Parallel entry

Interactive element?
├─ Hover → Lift or scale 105%
└─ Tap → Scale 95-98%
```

---

## Summary

**Good animation is invisible.**

Users don't think "wow, nice animation" - they think "this app feels responsive and polished."

Motion should:

- Feel instant (0.2-0.3s)
- Confirm actions
- Show relationships
- Never annoy

When in doubt, make it faster or remove it.
