# Resonance Frontend

A Next.js + Tailwind + shadcn UI for browsing saved songs, searching Ultimate Guitar, and downloading chord/tab HTML through the Go backend.

## Getting started

```bash
cd frontend
npm install

# configure the backend API endpoint (defaults to http://localhost:8080)
export NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

npm run dev
```

The app boots at http://localhost:3000.

## Features

- Lists saved songs (pulled from `GET /api/songs`)
- Displays chord/tab HTML via tabs
- Search form powered by `POST /api/search` with selectable chord/tab results
- Downloads selections with `POST /api/songs`

## Notes

- The provided shadcn v0 design token in the prompt is no longer valid; the layout uses native shadcn primitives instead.
- Update `NEXT_PUBLIC_API_BASE_URL` if the Go server runs on a different host/port.
