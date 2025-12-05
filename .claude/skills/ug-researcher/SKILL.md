---
name: ug-researcher
description: Fetch Ultimate Guitar chords via Jina and parse to Song JSON with position tracking. Use for "fetch UG", "get chords".
auto_trigger: true
keywords: [ultimate guitar, UG, fetch chords, chord sheet, tabs, jazz chords]
tools: [Bash, Read, Write]
---

# UG Researcher

Fetch chord sheets from Ultimate Guitar and convert to structured Song JSON with exact position tracking for accurate re-rendering.

## File Structure

```
.claude/skills/ug-researcher/
├── SKILL.md
├── src/
│   ├── index.ts       # Exports
│   ├── types.ts       # PositionedSong, Song types
│   └── ug-parser.ts   # Parser with position tracking
├── scripts/
│   ├── fetch.sh       # Fetch UG tab via Jina
│   ├── parse.ts       # Parse markdown to JSON
│   ├── validate.ts    # Validate against expected output
│   └── run-all.sh     # Run all validations
└── examples/
    ├── ug-folsom-prison.md
    ├── ug-folsom-prison.expected.json
    ├── ug-autumn-leaves.md
    ├── ug-autumn-leaves.expected.json
    └── ...
```

## Scripts

### Fetch UG Tab

```bash
./scripts/fetch.sh "https://tabs.ultimate-guitar.com/tab/artist/song-chords-12345" output.md
```

### Parse to JSON

```bash
npx tsx scripts/parse.ts input.md output.json
npx tsx scripts/parse.ts input.md --simple  # Frontend-compatible format
```

### Validate Example

```bash
npx tsx scripts/validate.ts ug-folsom-prison
```

### Run All Validations

```bash
./scripts/run-all.sh
```

## Programmatic Usage

```typescript
import { parseUGMarkdownPositioned, toSimpleSong } from './src';

// Full position data for accurate rendering
const positioned = parseUGMarkdownPositioned(markdown, url);

// Simple format for frontend
const simple = toSimpleSong(positioned);
```

## Output Format

### PositionedSong (Full)

```json
{
  "artist": "Johnny Cash",
  "title": "Folsom Prison Blues",
  "key": "G",
  "capo": 0,
  "tempo": 220,
  "sections": [{
    "name": "Verse 1",
    "lines": [{
      "chord": { "name": "G", "position": 2, "length": 1 },
      "lyric": "I hear the train",
      "lyricStart": 2,
      "lyricEnd": 17
    }]
  }]
}
```

### Expected JSON (Validation)

```json
{
  "artist": "Johnny Cash",
  "title": "Folsom Prison Blues",
  "key": "G",
  "sectionCount": 7,
  "chords": ["G", "G7", "C", "D7", "D"],
  "chordCount": 79
}
```

## Supported Chords

- **Basic:** C, Am, G7, F, Dm, E7
- **Extended:** Cmaj7, Dm9, G13, Fmaj9
- **Altered:** Am7b5, C7b9, G7#9, D7b9#11
- **Suspended:** Csus2, Dsus4, A7sus4
- **Added:** Cadd9, Fadd11, C6add9
- **Slash Bass:** Am/G, D/F#, C/E
- **Diminished/Augmented:** Cdim, Cdim7, Caug, C+

## Anti-Patterns

❌ Direct UG scraping (blocked, returns 404)
✅ Use Jina: `./scripts/fetch.sh`

❌ Manual JSON creation
✅ Use: `npx tsx scripts/parse.ts`

❌ Untested examples
✅ Run: `./scripts/run-all.sh`
