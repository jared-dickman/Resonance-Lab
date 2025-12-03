---
name: Jam Params
description: URL state system for agentic UI control. Buddy drives UI via ?song=x&bpm=120 params.
auto_trigger: true
keywords: [url params, nuqs, useJamParams, buddy, url state]
---

# Jam Params

**Mode**: URL State for Agentic Control

## Architecture

```
Buddy → navigate tool (with params) → NuqsAdapter → useJamParams hooks
```

## Files

| File | What |
|------|------|
| `lib/hooks/useJamParams.ts` | nuqs wrapper + parsers |
| `lib/params/pageParams.ts` | All params schema |
| `lib/agents/buddy/tools.ts` | 5 tools: search, download, list, get_artist_songs, navigate |

## Available Params

**Songs**: `artist`, `song`, `tab` (chords/tab/both)
**Jam**: `bpm`, `capo`, `transpose`, `view` (practice/perform/edit)
**Search**: `q`, `genre`, `difficulty`, `sort`

## Usage

```typescript
// Component reads URL state
import { useJamParams, jamParsers } from '@/lib/hooks';
const [bpm, setBpm] = useJamParams('bpm', jamParsers.bpm);
```

```typescript
// Buddy navigates with params (auto-builds query string)
navigate({ path: "/songs/Oasis/Wonderwall", params: { tab: "chords", bpm: "90" } })
```

## Adding Params

1. Add parser to `jamParsers` in `useJamParams.ts`
2. Add schema to `PageParams` in `pageParams.ts`
3. Buddy auto-discovers (invalid params return valid keys list)

## Principle

**URL as API** - Every UI state expressible as URL. Agent controls UI without DOM.
