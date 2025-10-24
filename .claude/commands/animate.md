---
description: Add UX-driven animations to a component using Framer Motion
---

$ARGUMENTS

Add animations following ANIMATION-IMPLEMENTATION-GUIDE.md:

**Timing:**
- 0.2s instant feedback (button taps)
- 0.3s state changes (toggles, swaps)
- 0.5s transitions (page/panel entry)
- 0.8s emphasis (important moments)
- 1.5s+ ambient loops

**Use animation constants from `lib/constants/animation.constants.ts`**

**Ensure:**
- Animations serve user intent (confirm, show, guide)
- Respect prefers-reduced-motion
- Animate transforms only (x, y, scale, rotate)
- Never block user interactions
