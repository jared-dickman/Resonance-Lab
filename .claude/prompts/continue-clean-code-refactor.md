# Continue Clean Code Refactor - Resonance Lab Frontend

## Context

A comprehensive clean code refactor following Uncle Bob's principles was initiated. **Phases 1-2 are complete**. Your task is to continue with **Phases 3-5** and complete the transformation.

## What's Already Done ✅

### Phase 1: Foundation Established
- ✅ Created constants files: `game.constants.ts`, `canvas.constants.ts`, `scroll.constants.ts`
- ✅ Created enums: `hitQuality.enum.ts`
- ✅ Created utilities: `audioContext.ts`, `canvasSetup.ts`, `scoring.ts`, `bpm.ts`

### Phase 2: Duplication Eliminated
- ✅ Centralized AudioContext creation (was duplicated 3×)
- ✅ Centralized canvas setup logic (was duplicated 2×)
- ✅ Centralized FINGER_COLORS constant (was duplicated 2×)
- ✅ Eliminated all 4 `as any` type assertions
- ✅ Fixed console.error violation in `error.tsx`
- ✅ Extracted 15+ magic values to named constants

### Files Already Refactored
- `ChordRhythmGame.tsx` (partial - magic values extracted)
- `Fretboard.tsx` (imports, AudioContext, constants)
- `PianoKeyboard.tsx` (imports, AudioContext, constants)
- `LoopPracticeMode.tsx` (BPM validation)
- `error.tsx` (logger)
- `chord.ts` (type safety)

## Your Mission: Complete Phases 3-5

---

## Phase 3: Decompose Large Functions (>20 lines)

### Target Files & Functions

**Priority 1: ChordRhythmGame.tsx**
```
Current violations:
- animate() function: 171 lines (lines 216-386)
- handleKeyPress() callback: 47 lines (lines 115-162)
```

**Tasks:**
1. Extract canvas drawing logic from `animate()`:
   - Create `lib/utils/canvas/drawBackground.ts`
   - Create `lib/utils/canvas/drawGrid.ts`
   - Create `lib/utils/canvas/drawHitZone.ts`
   - Create `lib/utils/game/drawFallingChord.ts`

2. Extract game state updates:
   - Create `lib/utils/game/updateGameState.ts`
   - Create `lib/utils/game/processChordSpawn.ts`

3. Refactor `handleKeyPress()`:
   - Extract hit detection to `lib/utils/game/detectHit.ts`
   - Extract combo calculation to `lib/utils/game/calculateCombo.ts`

**Priority 2: Fretboard.tsx**
```
Current violations:
- Canvas drawing effect: 174 lines (lines 43-217)
```

**Tasks:**
1. Extract to `lib/utils/canvas/fretboard/`:
   - `drawFretboardBackground.ts`
   - `drawStrings.ts`
   - `drawFrets.ts`
   - `drawMarkers.ts`
   - `drawFingerPositions.ts`

**Priority 3: PianoKeyboard.tsx**
```
Current violations:
- Canvas drawing effect: 168 lines (lines 49-217)
```

**Tasks:**
1. Extract to `lib/utils/canvas/piano/`:
   - `drawPianoBackground.ts`
   - `drawWhiteKeys.ts`
   - `drawBlackKeys.ts`
   - `drawPressedKeys.ts`
   - `drawFingerNumbers.ts`

**Priority 4: SongClient.tsx**
```
Current violations:
- calculateScrollSpeed(): 32 lines (lines 88-120)
- Visible chord tracking effect: 32 lines (lines 131-163)
- Auto-scroll animation effect: 44 lines (lines 165-209)
```

**Tasks:**
1. Extract scroll utilities to `lib/utils/scroll/`:
   - `calculateScrollSpeed.ts`
   - `trackVisibleChords.ts`
   - `animateAutoScroll.ts`

**Priority 5: LoopPracticeMode.tsx**
```
Current violations:
- Scroll monitoring effect: 48 lines (lines 70-118)
```

**Tasks:**
1. Extract to `lib/utils/loop/`:
   - `calculateLoopBoundaries.ts`
   - `monitorScrollPosition.ts`

---

## Phase 4: Naming Clarity & Remove Comments

### Target Comments to Eliminate

**File: LoopPracticeMode.tsx**
```typescript
// ❌ REMOVE: "// Calculate total lines for validation" (line 44)
// ❌ REMOVE: "// Initialize default loop range" (line 49)
// ❌ REMOVE: "// Sync practice BPM with main BPM" (line 62)
```
**Action:** Extract logic to well-named functions that make comments unnecessary

**File: Fretboard.tsx**
```typescript
// ❌ REMOVE: "// Draw fretboard background" (line 79)
// ❌ REMOVE: "// Draw strings" (line 85)
// ❌ REMOVE: "// Draw frets" (etc.)
```
**Action:** Function names should make purpose obvious

**File: ChordRhythmGame.tsx**
```typescript
// ❌ REMOVE: "// Build chord sequence with timing" (line 73)
// ❌ REMOVE: "// Spawn new chords" (line 221)
// ❌ REMOVE: "// Clear canvas" (line 266)
// ❌ REMOVE: "// Draw background grid" (line 270)
```
**Action:** Replace with extracted functions

### Naming Improvements

**Vague → Specific:**
```typescript
// ❌ BAD
const data = fetchSong();
const result = processData(data);

// ✅ GOOD
const songMetadata = fetchSongMetadata();
const validatedChordProgression = validateChordProgression(songMetadata);
```

**Add explicit return types to ALL functions**

---

## Phase 5: Enhanced Quality Tooling

### 5.1 Install Missing Dependencies

```bash
cd frontend
npm install --save-dev \
  eslint-plugin-sonarjs \
  eslint-plugin-jsx-a11y \
  @typescript-eslint/eslint-plugin@latest \
  @typescript-eslint/parser@latest
```

### 5.2 Update ESLint Configuration

**File: `frontend/.eslintrc.json`**

Add these rules to enforce clean code:

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:sonarjs/recommended",
    "plugin:jsx-a11y/recommended",
    "prettier"
  ],
  "rules": {
    // Function Quality
    "max-lines-per-function": ["error", {
      "max": 20,
      "skipBlankLines": true,
      "skipComments": true
    }],
    "max-params": ["error", 3],
    "complexity": ["error", 5],
    "max-depth": ["error", 3],

    // Naming & Quality
    "no-magic-numbers": ["error", {
      "ignore": [0, 1, -1],
      "ignoreArrayIndexes": true
    }],
    "no-console": "error",
    "prefer-const": "error",
    "no-var": "error",
    "eqeqeq": ["error", "always"],

    // TypeScript
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": ["error", {
      "allowExpressions": true
    }],

    // SonarJS Code Smells
    "sonarjs/cognitive-complexity": ["error", 10],
    "sonarjs/no-duplicate-string": ["error", 3],
    "sonarjs/no-identical-functions": "error"
  }
}
```

### 5.3 Create AST-Grep Rules

**File: `sgconfig.yml`** (already exists, enhance it)

Add rules to detect:
1. Magic string literals in JSX
2. Functions >20 lines
3. Duplicate code blocks
4. Missing return types

### 5.4 Update TypeScript Config

**File: `frontend/tsconfig.json`**

Ensure these strict checks are enabled:
```json
{
  "compilerOptions": {
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

---

## Specific Refactoring Examples

### Example 1: Extract Canvas Drawing

**Before (ChordRhythmGame.tsx):**
```typescript
// ❌ 171 lines in one function
const animate = () => {
  // Clear canvas
  ctx.fillStyle = 'rgba(10, 10, 10, 0.3)';
  ctx.fillRect(0, 0, width, height);

  // Draw background grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = 0; i < width; i += GAME_VISUAL.GRID_SPACING_PX) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
  }
  // ... 160 more lines
};
```

**After:**
```typescript
// ✅ Small, focused functions
import { clearCanvas } from '@/lib/utils/canvas/clearCanvas';
import { drawGrid } from '@/lib/utils/canvas/drawGrid';
import { drawHitZone } from '@/lib/utils/canvas/drawHitZone';
import { drawFallingChords } from '@/lib/utils/game/drawFallingChords';

const animate = (): void => {
  if (!isPlaying) return;

  const now = getCurrentGameTime(startTimeRef.current);

  clearCanvas(ctx, { width, height });
  drawGrid(ctx, { width, height });
  drawHitZone(ctx, { width, hitZoneY });
  drawFallingChords(ctx, fallingChords, chordTypes, { width, now });

  updateChordPositions(now, fallSpeed);
  requestAnimationFrame(animate);
};
```

**New utility files:**
```typescript
// lib/utils/canvas/clearCanvas.ts
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  size: { width: number; height: number }
): void {
  ctx.fillStyle = 'rgba(10, 10, 10, 0.3)';
  ctx.fillRect(0, 0, size.width, size.height);
}

// lib/utils/canvas/drawGrid.ts
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  size: { width: number; height: number }
): void {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;

  for (let i = 0; i < size.width; i += GAME_VISUAL.GRID_SPACING_PX) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size.height);
    ctx.stroke();
  }
}
```

### Example 2: Remove Comments via Named Functions

**Before:**
```typescript
// ❌ Comment explains what code does
// Calculate total lines for validation
const totalLines = song.sections.reduce((sum, section) =>
  sum + section.lines.length, 0
);
```

**After:**
```typescript
// ✅ Function name explains what it does
function calculateTotalSongLines(song: Song): number {
  return song.sections.reduce(
    (sum, section) => sum + section.lines.length,
    0
  );
}

const totalLines = calculateTotalSongLines(song);
```

---

## Success Criteria

When you're done, the codebase should have:

- ✅ **Zero functions >20 lines** (except rare exceptions with clear justification)
- ✅ **Zero explanatory comments** (code is self-documenting)
- ✅ **Zero magic values** (all extracted to constants)
- ✅ **ESLint passes** with 0 warnings using strict rules
- ✅ **TypeScript strict mode** with 0 errors
- ✅ **App compiles and runs** without issues

---

## Testing Strategy

After each refactoring:

1. **Run type-check:** `npm run type-check`
2. **Run lint:** `npm run lint`
3. **Check dev server:** App still compiles and runs
4. **Manual testing:** Open app in browser, test affected features

---

## Important Constraints

- ❌ **NEVER use `as any`** - create type guards instead
- ❌ **NEVER use `console.log`** - use `logger` from `@/lib/logger`
- ❌ **NEVER create backup files** - rely on git
- ✅ **ALWAYS add explicit return types** to functions
- ✅ **ALWAYS import utilities** instead of duplicating code
- ✅ **ALWAYS organize imports** (standard → external → internal → relative)

---

## Execution Order

1. Start with **Phase 3: Function Decomposition**
   - Focus on ChordRhythmGame.tsx first (biggest wins)
   - Then Fretboard.tsx and PianoKeyboard.tsx
   - Finally SongClient.tsx and LoopPracticeMode.tsx

2. Move to **Phase 4: Naming & Comments**
   - Remove all explanatory comments
   - Rename vague variables
   - Add return types

3. Finish with **Phase 5: Enhanced Tooling**
   - Install dependencies
   - Update ESLint config
   - Run validation
   - Fix any new violations

4. **Validate everything works**
   - Type-check passes
   - Lint passes
   - App runs successfully
   - Manual testing

---

## Report Back

When complete, provide:
1. **List of functions extracted** (before/after line counts)
2. **Comments removed** (count)
3. **Final metrics** (ESLint warnings, TypeScript errors, avg function size)
4. **New utility files created** (count and names)
5. **Any remaining violations** with plan to address

Good luck! Remember: **Clean code is self-documenting code**. If you need a comment to explain it, the code isn't clean enough yet.
