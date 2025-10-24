package main

import (
	"flag"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"scraper/internal/api"
	"scraper/internal/middleware"
	"scraper/internal/songmanager"
)

func main() {
	defaultAddr := getenv("ADDR", ":8080")
	defaultSongs := getenv("SONGS_DIR", filepath.Join("..", "songs"))

	addr := flag.String("addr", defaultAddr, "HTTP listen address")
	songsDir := flag.String("songs", defaultSongs, "Directory where song files are stored")
	flag.Parse()

	resolvedSongsDir, err := filepath.Abs(*songsDir)
	if err != nil {
		log.Fatalf("resolve songs directory: %v", err)
	}

	svc, err := songmanager.NewService(resolvedSongsDir)
	if err != nil {
		log.Fatalf("init song service: %v", err)
	}

	apiServer := api.New(svc)
	mux := http.NewServeMux()
	apiServer.Register(mux)

	rateLimiter := middleware.NewRateLimiter(100, time.Minute)
	handler := withCORS(
		rateLimiter.Middleware(
			middleware.Timeout(30 * time.Second)(
				loggingMiddleware(mux),
			),
		),
	)

	server := &http.Server{
		Addr:         *addr,
		Handler:      handler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Printf("Starting server on %s (songs dir: %s)", *addr, resolvedSongsDir)
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("HTTP server error: %v", err)
	}
}

func getenv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start))
	})
}
