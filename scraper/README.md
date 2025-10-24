# Resonance Backend

This module now exposes the Ultimate Guitar scraper as an HTTP API and keeps the existing CLI utility for scripting.

## Prerequisites

- Go 1.22+ (module currently targets Go 1.25)
- The `ultimate-guitar-scraper` module lives at `../ultimate-guitar-scraper` (configured via `replace` in `go.mod`).
- Node.js 18+ with the frontend dependencies installed (`cd ../frontend && npm install`) so the `songify.ts` script can run.

## Running the HTTP server

```bash
# From the repository root
cd scraper

# Make sure ../frontend/node_modules exists before starting the server
go run ./cmd/server --addr :8080 --songs ../songs
```

Environment variables can also be used:

- `ADDR` – overrides `--addr`
- `SONGS_DIR` – overrides `--songs`

### Available endpoints

- `GET /api/health` – health probe
- `GET /api/songs` – list saved songs (grouped client-side)
- `GET /api/songs/{artistSlug}/{songSlug}` – fetch chord/tab HTML + metadata
- `POST /api/search` – body `{ "artist": string, "title": string }`
- `POST /api/songs` – body `{ "artist": string, "title": string, "chordId"?: number, "tabId"?: number }`
  - When chords are saved, the server automatically runs `frontend/scripts/songify.ts` to materialise `song.json` alongside the HTML.

All endpoints respond with JSON and include permissive CORS headers for the frontend running on another port.

## CLI usage

The legacy `go run . "Artist" "Song"` flow now delegates to the shared service logic so it continues to select the best-rated chord/tab pair and saves the HTML into `../songs`.
