package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
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
		recoverMiddleware(
			rateLimiter.Middleware(
				middleware.Timeout(30*time.Second)(
					loggingMiddleware(mux),
				),
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

	// Graceful shutdown
	go func() {
		log.Printf("Starting server on %s (songs dir: %s)", *addr, resolvedSongsDir)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("HTTP server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
	}
	log.Println("Server stopped")
}

func getenv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

func withCORS(next http.Handler) http.Handler {
	allowedOrigins := map[string]bool{
		"https://resonance-lab.vercel.app":     true,
		"https://www.resonance-lab.vercel.app": true,
		"http://localhost:3000":                true,
		"http://localhost:3001":                true,
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if allowedOrigins[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		} else if origin == "" {
			// Allow requests without Origin header (non-browser clients)
			w.Header().Set("Access-Control-Allow-Origin", "*")
		}

		// Allow common headers that browsers send
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Accept, Accept-Language, Content-Language, Range")

		// Allow methods used by the API
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")

		// Cache preflight requests for 24 hours to reduce overhead
		w.Header().Set("Access-Control-Max-Age", "86400")

		// Expose headers that frontend might need to read
		w.Header().Set("Access-Control-Expose-Headers", "Content-Length, Content-Type")

		// Handle preflight requests
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

// recoverMiddleware catches panics and returns a safe 500 response
func recoverMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("PANIC RECOVERED: %v", err)
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				w.Write([]byte(`{"error":"Internal server error"}`))
			}
		}()
		next.ServeHTTP(w, r)
	})
}
