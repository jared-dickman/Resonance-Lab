# Resonance Lab

Professional music workspace for songwriters, composers, and musicians.

## Features

- **Songwriter**: Search and save chord charts from Ultimate Guitar
- **Jam Assistant**: Intelligent chord progression suggestions
- **Music Theory**: Interactive scales, chords, and theory reference
- **Metronome**: Professional tempo trainer with tap tempo
- **Composer**: AI-powered melody composition
- **Pedalboard**: Virtual guitar effects (Reverb, Delay, Chorus, Tremolo, etc.)

## Architecture

- **Frontend**: Next.js 14 (App Router), React, TypeScript, TailwindCSS
- **Backend**: Go HTTP server for Ultimate Guitar scraper API
- **Audio**: Tone.js for audio synthesis and playback
- **Deployment**: Vercel (Frontend) + Hostinger VPS (Backend)

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Go 1.21+ (for backend API)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3000

### Backend API Setup

The backend provides the Ultimate Guitar scraper API:

```bash
cd scraper
go run cmd/server/main.go
```

Backend runs on http://localhost:8080

**API Endpoints:**
- `GET /api/health` - Health check
- `GET /api/songs` - List saved songs
- `GET /api/songs/{artist}/{song}` - Get song details
- `POST /api/search` - Search Ultimate Guitar
- `POST /api/songs` - Download and save song

### Development Without Backend

The frontend gracefully degrades when the backend isn't running:
- Music theory, metronome, composer, and pedalboard work offline
- Songwriter and jam features require the backend API

You'll see a helpful console message: "💡 Backend API unavailable. To enable full features, start the server"

## Production Environment Variables

### Frontend (.env.production)

```bash
NEXT_PUBLIC_API_BASE_URL=https://srv1015344.hstgr.cloud
```

### Backend (Docker/VPS)

```bash
ADDR=:8080
SONGS_DIR=/app/songs
```

## Troubleshooting

### "AudioContext was not allowed to start"

This is expected browser behavior. Audio contexts can only start after user interaction. Click "Start" on the metronome or play a note to initialize audio.

### "CORS policy" errors

Verify the backend is running and CORS headers are configured (they are by default in main.go).

### Slow API responses

The search endpoint makes concurrent requests to Ultimate Guitar, but external API latency varies (500-1500ms typical).

## Project Structure

```
Resonance-Lab/
├── frontend/           # Next.js application
│   ├── app/           # Pages and routes
│   ├── components/    # React components
│   ├── lib/           # Utilities, hooks, monitoring
│   └── public/        # Static assets
├── scraper/           # Go backend API
│   ├── cmd/server/    # Main application
│   └── internal/      # API handlers, middleware
└── songs/             # Saved chord charts (gitignored)
```

## Performance Optimizations

- Package import optimization for large libraries (Tone.js, Lucide)
- Request caching and deduplication
- Retry logic with exponential backoff
- Health monitoring and performance tracking
- Lazy loading for heavy music data libraries

## License

MIT
