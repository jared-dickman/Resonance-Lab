package api

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"scraper/internal/cache"
	"scraper/internal/songmanager"
)

// Server wires song management operations into HTTP handlers.
type Server struct {
	svc   *songmanager.Service
	cache *cache.Cache
}

// New creates a Server backed by the provided song service.
func New(svc *songmanager.Service) *Server {
	return &Server{
		svc:   svc,
		cache: cache.New(5 * time.Minute),
	}
}

// Register attaches the API routes to the provided mux.
func (s *Server) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/health", s.handleHealth)
	mux.HandleFunc("GET /api/artists", s.handleListArtists)
	mux.HandleFunc("GET /api/songs", s.handleListSongs)
	mux.HandleFunc("GET /api/songs/{artist}/{song}", s.handleGetSong)
	mux.HandleFunc("POST /api/search", s.handleSearch)
	mux.HandleFunc("POST /api/songs", s.handleDownload)
	mux.HandleFunc("DELETE /api/songs/{artist}/{song}", s.handleDeleteSong)
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{
		"status":  "ok",
		"version": "1.0.0",
		"message": "Resonance Lab API is rockin'!",
	})
}

func (s *Server) handleListArtists(w http.ResponseWriter, r *http.Request) {
	const cacheKey = "artists:list"

	if cached, ok := s.cache.Get(cacheKey); ok {
		writeJSON(w, http.StatusOK, cached)
		return
	}

	artists, err := s.svc.ListArtists(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}

	s.cache.Set(cacheKey, artists)
	writeJSON(w, http.StatusOK, artists)
}

func (s *Server) handleListSongs(w http.ResponseWriter, r *http.Request) {
	const cacheKey = "songs:list"

	if cached, ok := s.cache.Get(cacheKey); ok {
		writeJSON(w, http.StatusOK, cached)
		return
	}

	songs, err := s.svc.ListSongs(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}

	s.cache.Set(cacheKey, songs)
	writeJSON(w, http.StatusOK, songs)
}

func (s *Server) handleGetSong(w http.ResponseWriter, r *http.Request) {
	artist := r.PathValue("artist")
	song := r.PathValue("song")
	detail, err := s.svc.GetSong(r.Context(), artist, song)
	if err != nil {
		if errors.Is(err, songmanager.ErrSongNotFound) {
			writeError(w, http.StatusNotFound, err)
			return
		}
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusOK, detail)
}

func (s *Server) handleSearch(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Artist string `json:"artist"`
		Title  string `json:"title"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	result, err := s.svc.Search(r.Context(), req.Artist, req.Title)
	if err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (s *Server) handleDownload(w http.ResponseWriter, r *http.Request) {
	var req songmanager.DownloadRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	detail, err := s.svc.Download(r.Context(), req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}

	s.cache.Invalidate("songs:list")
	writeJSON(w, http.StatusOK, detail)
}

func (s *Server) handleDeleteSong(w http.ResponseWriter, r *http.Request) {
	artist := r.PathValue("artist")
	song := r.PathValue("song")

	err := s.svc.Delete(r.Context(), artist, song)
	if err != nil {
		if errors.Is(err, songmanager.ErrSongNotFound) {
			writeError(w, http.StatusNotFound, err)
			return
		}
		writeError(w, http.StatusInternalServerError, err)
		return
	}

	s.cache.Invalidate("songs:list")
	w.WriteHeader(http.StatusNoContent)
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, err error) {
	// Only expose user-friendly errors to clients, not internal details
	msg := "An error occurred"
	if status == http.StatusNotFound {
		msg = "Resource not found"
	} else if status == http.StatusBadRequest {
		// Bad request errors are typically validation, safe to expose
		msg = err.Error()
	}
	writeJSON(w, status, map[string]string{"error": msg})
}
