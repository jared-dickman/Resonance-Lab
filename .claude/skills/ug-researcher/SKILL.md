---
name: ug-researcher
description: Search UG API for best tab, fetch via Jina, verify metadata, output Song JSON
auto_trigger: true
keywords: [ultimate guitar, UG, fetch chords, tabs]
tools: [Bash, Read, Write, WebSearch]
---

# UG Researcher

Search UG API → get best rated tab → fetch via Jina → verify metadata → output Song JSON.

## Workflow

```typescript
import { getBestTabUrl } from './src/ug-api';
import { parseUGMarkdown } from './src/ug-parser';

// 1. Search API for best tab (filters out Pro+ content)
const url = await getBestTabUrl('Oasis', 'Wonderwall');

// 2. Fetch via Jina
const md = await fetch(`https://r.jina.ai/${url}`).then(r => r.text());

// 3. Parse to JSON
const song = parseUGMarkdown(md, url);

// 4. WebSearch to verify: "{title} original composer key"
//    Update: artist, originalKey, performer (if cover)
```

## API Search (src/ug-api.ts)

```typescript
// Search returns best tabs sorted by: Rating × ln(Votes)
const results = await searchUG('Johnny Cash', 'Folsom Prison');
// → [{id, song_name, artist_name, rating, votes, score, tab_url}, ...]

// Get single best URL
const url = await getBestTabUrl('Johnny Cash', 'Folsom Prison');
// → "https://tabs.ultimate-guitar.com/tab/johnny-cash/folsom-prison-blues-chords-811776"
```

**Filters out Pro+ content:** Official, Pro, Power (404 via Jina)

## Output Format

```json
{
  "artist": "Joseph Kosma",
  "title": "Autumn Leaves",
  "key": "Bm",
  "originalKey": "Am",
  "performer": "Eric Clapton",
  "sections": [{
    "name": "Verse 1",
    "lines": [
      { "chord": null, "lyric": "The falling", "lineGroup": 1 },
      { "chord": { "name": "Em7" }, "lyric": "leaves", "lineGroup": 1 }
    ]
  }]
}
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npx tsx -e "..."` | Inline API search + parse |
| `scripts/fetch.sh <url>` | Fetch via Jina |
| `scripts/parse.ts <md> <json>` | Parse markdown |

## Anti-Patterns

- ❌ Guess tab URLs (404 risk)
- ❌ Trust UG URL for original artist
- ❌ Include Pro+/Official tabs
- ✅ Always use API search first
- ✅ WebSearch to verify metadata
