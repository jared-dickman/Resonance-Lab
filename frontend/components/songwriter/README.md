# Songwriter Assistant - Production Architecture

## Overview

Production-grade songwriter assistant with exhaustive type coverage, resizable panels, and comprehensive JSON agent protocol.

## Architecture

### Directory Structure

```
songwriter/
├── types/           # Exhaustive type definitions
│   ├── song.ts      # Song domain types (50+ types)
│   ├── chat.ts      # Agent protocol types (20+ types)
│   ├── ui.ts        # UI state types (20+ types)
│   ├── persistence.ts # Storage types (20+ types)
│   ├── legacy.ts    # Backwards compatibility
│   └── index.ts     # Clean exports
├── state/           # Business logic (pure functions)
│   ├── lyricAnalyzer.ts       # Lyric analysis functions
│   ├── songStateManager.ts    # State transitions
│   └── draftVersionControl.ts # Version management
├── chat/            # Agent communication
│   ├── contextExtractor.ts  # Build agent requests
│   ├── messageBuilder.ts    # Format messages
│   └── responseParser.ts    # Parse responses
├── persistence/     # Storage layer
│   ├── localStorageAdapter.ts  # localStorage impl
│   └── draftSerializer.ts      # Serialization
└── ui/              # React components
    ├── SongwriterClient.tsx      # Main orchestrator
    ├── ChatInterface.tsx         # AI chat
    ├── LyricsEditor.tsx          # Lyrics editing
    ├── ChordProgressionBuilder.tsx
    └── DraftManager.tsx
```

### Design Principles

1. **Self-Documenting Names**: Function names describe exact behavior

   - `extractSyllableCountFromLyricLine` not `getSyllables`
   - `updateSongTitle` not `setTitle`
   - `createEmptySongState` not `init`

2. **Pure Functions**: Business logic separated from React

   - All functions in `state/` and `chat/` are pure
   - No side effects in domain logic
   - Testable without React

3. **Exhaustive Types**: 100+ type definitions

   - Zero `any` types
   - Explicit return types on all functions
   - Readonly arrays/objects for immutability
   - Union types for all enums

4. **Small Functions**: Max 20 lines per function
   - Single responsibility principle
   - Easy to understand and test
   - Composable building blocks

## Type System

### Song Types (`types/song.ts`)

Complete representation of song state with 35+ interfaces:

- **Musical Structure**: `SectionType`, `RhymeScheme`, `ChordQuality`, `TimeSignature`
- **Lyric Analysis**: `LyricLine`, `SectionLyrics`, `SyllableStress`
- **Chord Theory**: `ChordInstance`, `ChordProgression`, `HarmonicFunction`
- **Narrative**: `StoryArc`, `CharacterDevelopment`, `MetaphorThread`
- **Analytics**: `TimeAnalytics`, `EditHistoryEntry`, `VocabularyAnalysis`

### Chat Types (`types/chat.ts`)

Comprehensive agent protocol with 15+ interfaces:

- **Context**: `UserQueryContext`, `CompleteSongContext` (50+ fields total)
- **Suggestions**: `LyricSuggestion`, `ChordSuggestion`, `StructureSuggestion`
- **Communication**: `ConversationMessage`, `AgentRequest`, `AgentResponse`
- **State Machine**: `AgentState` (idle | thinking | streaming | complete | error)

### UI Types (`types/ui.ts`)

Complete UI state representation:

- **Layout**: `PanelConfiguration`, `PanelLayoutState`, `ResizeState`
- **Editor**: `EditorState`, `TextPosition`, `ScrollPosition`
- **Interactions**: `DragState`, `ModalState`, `FormState`

### Persistence Types (`types/persistence.ts`)

Storage and versioning:

- **Storage**: `StorageAdapter`, `StorageQuota`, `SerializedDraft`
- **Versioning**: `DraftSnapshot`, `VersionControl`, `MigrationRecord`
- **Sync**: `SyncState`, `ConflictResolution`

## Key Features

### 1. Resizable Panels

Three-panel layout with drag handles:

```typescript
<PanelGroup direction="horizontal" onLayout={handlePanelResize}>
  <Panel defaultSize={25} minSize={15}>Chat</Panel>
  <PanelResizeHandle />
  <Panel defaultSize={40} minSize={15}>Lyrics</Panel>
  <PanelResizeHandle />
  <Panel defaultSize={35} minSize={15}>Chords</Panel>
</PanelGroup>
```

- Panel sizes persist to localStorage
- Minimum size enforcement (15%)
- Smooth resize interactions
- Visual feedback on hover

### 2. JSON Agent Protocol

Every agent request includes 50+ context fields:

```typescript
interface AgentRequest {
  requestId: string;
  userQuery: UserQueryContext;
  songContext: CompleteSongContext; // Complete song state
  conversationHistory: ConversationHistory;
  requestTimestamp: Date;
  clientVersion: string;
  sessionId: string;
}
```

Complete context enables sophisticated AI:

- Rhyme suggestions aware of existing scheme
- Chord recommendations factoring current key
- Theme consistency checking
- Structure advice based on genre

### 3. Lyric Analysis

Comprehensive analysis of every line:

```typescript
function analyzeSectionLyrics(
  sectionType: SectionType,
  sectionIndex: number,
  linesText: ReadonlyArray<string>
): SectionLyrics;
```

Extracts:

- Syllable count per line
- Stress patterns
- Rhyme scheme (AABB, ABAB, etc.)
- Emotional tone
- Narrative perspective
- Verb tense

### 4. State Management

Immutable state updates:

```typescript
function updateSongTitle(state: CompleteSongState, newTitle: string): CompleteSongState {
  return {
    ...state,
    metadata: { ...state.metadata, title: newTitle },
    editHistory: [...state.editHistory, editEntry],
  };
}
```

All state transitions create new objects with edit history.

### 5. localStorage Persistence

Type-safe storage adapter:

```typescript
const storage = createLocalStorageAdapter();
await storage.save('panelLayout', panelSizes);
const saved = await storage.load<number[]>('panelLayout');
```

Handles:

- Date serialization
- Map/Set serialization
- Quota exceeded errors
- Checksums for validation

## Usage

### Creating Empty Song

```typescript
import { createEmptySongState } from './state/songStateManager';

const songState = createEmptySongState();
```

### Updating Lyrics

```typescript
import { updateLyricsText } from './state/songStateManager';

const updated = updateLyricsText(songState, newLyrics);
setSongState(updated);
```

### Building Agent Request

```typescript
import { buildAgentRequest } from './chat/contextExtractor';

const request = buildAgentRequest(queryText, songState, conversationHistory, uiState, sessionId);
```

### Analyzing Lyrics

```typescript
import { extractSyllableCountFromLyricLine } from './state/lyricAnalyzer';

const syllables = extractSyllableCountFromLyricLine('This is a test line');
// Returns: 5
```

## Type Safety

All code passes TypeScript strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true
  }
}
```

Zero type errors, zero `any` types.

## Function Naming Convention

Every function name describes exact behavior:

| Function                            | Purpose                     |
| ----------------------------------- | --------------------------- |
| `extractSyllableCountFromLyricLine` | Count syllables in line     |
| `detectStressPatternInLine`         | Identify stressed syllables |
| `analyzeRhymeSchemeForSection`      | Determine rhyme pattern     |
| `parseLyricsIntoSections`           | Split lyrics by sections    |
| `createEmptySongState`              | Initialize new song         |
| `updateSongTitle`                   | Change title immutably      |
| `buildAgentRequest`                 | Construct API request       |
| `savePanelLayoutToStorage`          | Persist panel sizes         |

No abbreviations, no ambiguity.

## Testing

Pure functions are easily testable:

```typescript
import { countSyllablesInWord } from './state/lyricAnalyzer';

test('counts syllables correctly', () => {
  expect(countSyllablesInWord('hello')).toBe(2);
  expect(countSyllablesInWord('beautiful')).toBe(3);
});
```

## Performance

- Immutable updates use structural sharing
- localStorage saves are async
- Panel resize throttled
- Pure functions are memoizable

## Future Enhancements

- Backend API integration
- Real-time collaboration
- MIDI export
- Audio playback
- Undo/redo stack
- Keyboard shortcuts
- Accessibility improvements

## Code Quality Standards

- ✅ TypeScript strict mode enabled
- ✅ Zero `any` types
- ✅ Explicit return types
- ✅ Function max 20 lines
- ✅ Self-documenting names
- ✅ Pure business logic
- ✅ Immutable state
- ✅ Comprehensive types (100+)
- ✅ Panel persistence
- ✅ 50+ field agent protocol
