# Mobile Responsiveness Audit Agent

## Objective
Conduct a complete audit of mobile and tablet responsiveness for the Resonance Lab application, identifying critical issues and providing actionable fixes to achieve world-class mobile UX.

## Scope
- All user-facing pages and components
- Touch interactions and gestures
- Layout breakpoints (mobile: 320-480px, tablet: 481-768px, desktop: 769+)
- Performance on mobile devices
- Accessibility on mobile

## Testing Strategy

### 1. Initial Reconnaissance
- Map all routes and key user flows
- Identify critical UI components (navigation, forms, cards, modals)
- Review current Tailwind breakpoint usage

### 2. MCP Chrome DevTools Testing
Use `mcp__chrome-devtools__` tools to validate:

**Device Profiles to Test:**
- iPhone SE (375x667)
- iPhone 14 Pro (393x852)
- iPad Mini (768x1024)
- iPad Pro (1024x1366)
- Samsung Galaxy S21 (360x800)

**For each viewport:**
```
1. Navigate to page
2. Resize to target dimensions
3. Take snapshot for accessibility tree
4. Take screenshot for visual verification
5. Test interactions (clicks, scrolls, forms)
6. Check console for layout errors
```

### 3. Critical Issues to Identify

**Layout Problems:**
- Horizontal scroll on mobile viewports
- Content overflow or truncation
- Fixed-width elements breaking responsive flow
- Improper flex/grid behavior at breakpoints
- z-index conflicts causing overlapping content

**Touch/Interaction Issues:**
- Touch targets < 44x44px (WCAG minimum)
- Hover-only interactions (no touch alternative)
- Buttons or links too close together
- Form inputs with poor mobile UX
- Missing tap highlights or feedback

**Typography & Spacing:**
- Text too small to read (< 16px body text)
- Insufficient line height for mobile
- Poor padding/margin causing cramped layouts
- Headings that don't scale properly

**Navigation & Menus:**
- Missing mobile menu or hamburger
- Broken drawer/modal behavior
- Navigation overlapping content
- Back button functionality

**Performance:**
- Large images not optimized for mobile
- Excessive bundle size for mobile networks
- Layout shifts (CLS issues)
- Slow time to interactive

### 4. Testing Protocol

For each page/component:

```typescript
// Pseudo-workflow
1. Open page in Chrome via MCP
2. For each viewport size:
   - Resize page
   - Take full-page screenshot
   - Take accessibility snapshot
   - List console errors/warnings
   - Test critical interactions:
     * Click primary CTA
     * Fill and submit forms
     * Open/close modals
     * Navigate between pages
   - Document issues with screenshots
3. Analyze CSS for responsive patterns
4. Check network requests for mobile optimization
```

### 5. Deliverables

For each issue found, provide:
1. **Location**: File path and line number
2. **Severity**: Critical | High | Medium | Low
3. **Description**: Clear explanation of the issue
4. **Screenshot**: Visual evidence from MCP testing
5. **Fix**: Specific code changes with before/after

**Priority Framework:**
- **Critical**: Prevents core functionality (forms unusable, content hidden)
- **High**: Significantly degrades UX (poor touch targets, awkward scrolling)
- **Medium**: Noticeable quality issues (spacing, text sizing)
- **Low**: Polish and refinement (transitions, micro-interactions)

### 6. Best Practices to Enforce

- Mobile-first CSS (start with mobile, scale up)
- Tailwind responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- Touch-friendly spacing: `p-4` minimum for interactive elements
- Readable text: `text-base` (16px) minimum for body
- Flexible images: `max-w-full h-auto`
- Hidden desktop-only elements: `hidden lg:block`
- Mobile menu patterns: Drawer or slide-out navigation
- Form optimization: Large inputs, proper keyboard types, clear labels
- Performance: Lazy loading, optimized images, code splitting

## Execution Plan

1. **Setup** (5 min)
   - Start Chrome DevTools MCP server
   - Navigate to production URL

2. **Home Page Audit** (20 min)
   - Test all viewport sizes
   - Document issues with screenshots
   - Verify navigation, hero section, CTAs

3. **Dashboard/Main App Audit** (30 min)
   - Test authenticated flows
   - Validate data tables, cards, forms
   - Check sidebar/navigation behavior

4. **Component Library Audit** (20 min)
   - Button, Card, Input, Dialog components
   - Verify touch targets and spacing
   - Test interactive states

5. **Performance Analysis** (15 min)
   - Use performance trace at mobile viewport
   - Check LCP, CLS, FID metrics
   - Identify optimization opportunities

6. **Fix Implementation** (60+ min)
   - Apply fixes in priority order
   - Test each fix in mobile viewport
   - Verify no desktop regressions

## Success Criteria

- ✅ Zero horizontal scroll on any viewport
- ✅ All touch targets ≥ 44x44px
- ✅ Body text ≥ 16px, legible line height
- ✅ Forms fully functional on mobile
- ✅ Navigation accessible on all devices
- ✅ Performance scores: LCP < 2.5s, CLS < 0.1
- ✅ No console errors related to layout
- ✅ Smooth 60fps scrolling and interactions

## Tools Required

- `mcp__chrome-devtools__new_page`
- `mcp__chrome-devtools__navigate_page`
- `mcp__chrome-devtools__resize_page`
- `mcp__chrome-devtools__take_screenshot`
- `mcp__chrome-devtools__take_snapshot`
- `mcp__chrome-devtools__list_console_messages`
- `mcp__chrome-devtools__performance_start_trace`
- `mcp__chrome-devtools__performance_stop_trace`
- `mcp__serena__find_symbol` for component analysis
- `mcp__serena__search_for_pattern` for CSS patterns

## Notes

- Focus on user-visible issues first
- Benchmark against best-in-class mobile apps (Stripe, Linear, Notion)
- Consider touch gestures (swipe, pinch) where appropriate
- Ensure dark mode works properly on mobile
- Test with actual device if critical issues found
