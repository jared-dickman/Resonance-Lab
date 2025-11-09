# Scraper HTTP Server

## Requirements
- Go 1.22+ (module targets Go 1.25).
- Frontend deps installed once so `songify` can run: `cd ../../frontend && npm install`.

## Start
```bash
cd scraper
go run ./cmd/server --addr :8080 --songs ../songs
```

Hit `http://localhost:8080/api/health` to confirm `"status":"ok"`.  
Stop with `Ctrl+C`.
