# 🎸 STUDIO: THE UNIVERSE-SAVING PRACTICE COACH

## MISSION-CRITICAL CONTEXT

Invoke `rules-loader` skill immediately. Load: `components.md`, `styling.md`, `animations.md`

## THE VISION

Build a MIND-MELTINGLY SPECTACULAR UI-only demo of Jamium's Practice Studio - a CONSCIOUSNESS-EXPANDING practice experience that makes Yousician weep and JazzEdge question reality.

**Core Innovation:** Buddy IS the coach. No new AI - leverage existing conversational agent with practice-aware context.

## SACRED ARCHITECTURE

```
/studio
├── page.tsx                    # Route shell
├── StudioClient.tsx            # Main orchestrator
├── components/
│   ├── PracticeSession.tsx     # Active session view
│   ├── SessionSetup.tsx        # Pre-session config
│   ├── ProgressDashboard.tsx   # Stats & streaks
│   ├── NoteHighway.tsx         # Guitar Hero visual
│   ├── FocusTimer.tsx          # Pomodoro widget
│   └── EarTrainer.tsx          # Interval recognition
└── hooks/
    └── usePracticeSession.ts   # Local state (no API)
```

## LEGENDARY FEATURES (UI DEMO ONLY)

### 1. SESSION SETUP
- Pick song from **existing library** (reuse `useSongs` hook)
- Select practice mode: Full Play | Loop Section | Slow Down | Ear Training
- Set focus timer: 15/25/45 min pomodoro
- Difficulty: Simplified | Standard | As Recorded

### 2. NOTE HIGHWAY (Guitar Hero Style)
- Scrolling notes/chords approaching "now" line
- Color-coded by finger/string
- Mock accuracy feedback (random 85-98%)
- Tempo adjustment slider
- **NO real audio analysis** - purely visual demo

### 3. BUDDY INTEGRATION
- Buddy panel auto-opens in "coach mode"
- Context chip shows: `practice • [song] • [mode]`
- Hardcoded encouraging messages cycling
- "Great run! Try the bridge next?" style prompts

### 4. PROGRESS DASHBOARD
- Streak counter (localStorage mock)
- Weekly practice minutes chart (hardcoded data)
- Skills radar: Timing | Accuracy | Speed | Ear
- Achievement badges (locked/unlocked states)

### 5. FOCUS MODE
- Distraction-free fullscreen option
- Pomodoro timer with break reminders
- Session summary on completion

## ABSOLUTELY CRITICAL PATTERNS

**Reuse existing atoms:** `SapphireCard`, `Button`, `Spinner`, animation constants

**Buddy context extension:**
```tsx
// In BuddyContext - add practice mode
const context = {
  page: 'studio',
  mode: 'practice',
  song: currentSong?.title,
  sessionType: 'loop-section'
};
```

**Mock data shape:**
```tsx
const MOCK_PROGRESS = {
  streak: 7,
  weeklyMinutes: [45, 30, 60, 0, 25, 40, 55],
  totalSongs: 12,
  accuracy: 87,
};
```

## VISUAL LANGUAGE

- Dark mode always
- Blue/purple gradients (brand colors)
- `from-blue-500/20 to-purple-500/20` for cards
- Framer Motion for ALL transitions
- `spring` physics for satisfying feedback

## WHAT NOT TO BUILD

- NO Web Audio API integration
- NO microphone access
- NO real-time pitch detection
- NO backend endpoints
- NO database schemas

This is a SPECTACULAR VISUAL PROTOTYPE to validate UX before engineering investment.

## SUCCESS STATE

User can:
1. Select song from their library
2. See beautiful Note Highway animation
3. Watch fake accuracy scores roll in
4. Feel the dopamine of streak badges
5. Chat with Buddy about their "progress"

The demo should make stakeholders say: "SHIP IT YESTERDAY"
