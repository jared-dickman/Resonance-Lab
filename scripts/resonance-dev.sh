#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT/frontend"
SCRAPER_DIR="$ROOT/scraper"
SONGS_DIR="$ROOT/songs"
FRONTEND_HOST="127.0.0.1"
DEFAULT_FRONTEND_PORT=3000
SCRAPER_HOST="127.0.0.1"
DEFAULT_SCRAPER_PORT=8080
LOG_DIR="$ROOT/scripts/logs"
SESSION_ID="$(date +%Y%m%d-%H%M%S)"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[setup] Missing required command: $1"
    exit 1
  fi
}

require_cmd go
require_cmd npm
require_cmd curl
require_cmd lsof

mkdir -p "$LOG_DIR"

if [ ! -d "$SONGS_DIR" ]; then
  echo "[setup] Creating songs directory at $SONGS_DIR"
  mkdir -p "$SONGS_DIR"
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "[setup] Installing frontend dependencies..."
  (cd "$FRONTEND_DIR" && npm install)
fi

cleanup() {
  local exit_code=$?
  echo
  echo "[system] Shutting down development services..."
  terminate_tree "${SCRAPER_PID:-}"
  terminate_tree "${FRONTEND_PID:-}"
  wait "${SCRAPER_PID:-}" 2>/dev/null || true
  wait "${FRONTEND_PID:-}" 2>/dev/null || true
  exit "$exit_code"
}
trap cleanup EXIT INT TERM HUP

terminate_tree() {
  local pid=$1
  if [ -z "$pid" ] || ! kill -0 "$pid" 2>/dev/null; then
    return
  fi
  local pgid
  pgid=$(ps -o pgid= "$pid" 2>/dev/null | tr -d ' ')
  if [ -n "$pgid" ]; then
    kill -TERM "-$pgid" 2>/dev/null || true
    # escalate if needed
    sleep 1
    kill -KILL "-$pgid" 2>/dev/null || true
    return
  fi
  kill -TERM "$pid" 2>/dev/null || true
  sleep 1
  kill -KILL "$pid" 2>/dev/null || true
}

find_free_port() {
  local start=$1
  local max_steps=${2:-32}
  local port=$start
  local steps=0
  while [ $steps -le $max_steps ]; do
    if ! lsof -ti tcp:$port >/dev/null 2>&1; then
      echo "$port"
      return 0
    fi
    port=$((port + 1))
    steps=$((steps + 1))
  done
  echo "[error] Unable to find a free port near $start" >&2
  exit 1
}

FRONTEND_PORT=$(find_free_port "$DEFAULT_FRONTEND_PORT")
SCRAPER_PORT=$(find_free_port "$DEFAULT_SCRAPER_PORT")
SCRAPER_ADDR="${SCRAPER_HOST}:${SCRAPER_PORT}"

SCRAPER_LOG="$LOG_DIR/scraper-${SESSION_ID}.log"
FRONTEND_LOG="$LOG_DIR/frontend-${SESSION_ID}.log"
: >"$SCRAPER_LOG"
: >"$FRONTEND_LOG"

echo "[system] Using ports → frontend ${FRONTEND_HOST}:${FRONTEND_PORT}, scraper ${SCRAPER_ADDR}"
echo "[system] Log files →"
echo "  • Scraper : $SCRAPER_LOG"
echo "  • Frontend: $FRONTEND_LOG"

wait_for_url() {
  local name=$1
  local url=$2
  local pid=$3
  printf "[wait] Waiting for %s (%s)..." "$name" "$url"
  until curl -fsS "$url" >/dev/null 2>&1; do
    if ! kill -0 "$pid" 2>/dev/null; then
      printf "\n[error] %s process exited early.\n" "$name"
      wait "$pid"
      exit 1
    fi
    printf "."
    sleep 1
  done
  printf " ready!\n"
}

echo "[system] Starting scraper API..."
(
  cd "$SCRAPER_DIR"
  GOFLAGS="${GOFLAGS:-}" go run ./cmd/server --addr "$SCRAPER_ADDR" --songs ../songs
) 2>&1 | tee -a "$SCRAPER_LOG" &
SCRAPER_PID=$!

echo "[system] Starting Next.js dev server..."
(
  cd "$FRONTEND_DIR"
  npm run dev -- --hostname "$FRONTEND_HOST" --port "$FRONTEND_PORT"
) 2>&1 | tee -a "$FRONTEND_LOG" &
FRONTEND_PID=$!

wait_for_url "scraper" "http://${SCRAPER_ADDR}/api/health" "$SCRAPER_PID"
wait_for_url "frontend" "http://${FRONTEND_HOST}:${FRONTEND_PORT}/songwriter" "$FRONTEND_PID"

URL="http://${FRONTEND_HOST}:${FRONTEND_PORT}/songwriter"
if command -v open >/dev/null 2>&1; then
  open -g "$URL"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL" >/dev/null 2>&1 &
else
  echo "[system] Please open $URL manually."
fi

echo "[system] Development environment ready ✅"
echo "[system] Frontend: http://${FRONTEND_HOST}:${FRONTEND_PORT}  |  API: http://${SCRAPER_ADDR}"
echo "[system] Tail logs with:"
echo "  tail -f $FRONTEND_LOG"
echo "  tail -f $SCRAPER_LOG"
echo "[system] Press Ctrl+C to stop both services."

wait "$SCRAPER_PID" "$FRONTEND_PID"
