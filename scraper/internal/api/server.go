package api

import (
	"encoding/json"
	"errors"
	"net/http"

	"scraper/internal/songmanager"
)

// Server wires song management operations into HTTP handlers.
type Server struct {
	svc *songmanager.Service
}

// New creates a Server backed by the provided song service.
func New(svc *songmanager.Service) *Server {
	return &Server{svc: svc}
}

// Register attaches the API routes to the provided mux.
func (s *Server) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/health", s.handleHealth)
	mux.HandleFunc("GET /api/songs", s.handleListSongs)
	mux.HandleFunc("GET /api/songs/{artist}/{song}", s.handleGetSong)
	mux.HandleFunc("POST /api/search", s.handleSearch)
	mux.HandleFunc("POST /api/songs", s.handleDownload)
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) handleListSongs(w http.ResponseWriter, r *http.Request) {
	songs, err := s.svc.ListSongs(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
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
	writeJSON(w, http.StatusOK, detail)
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, err error) {
	writeJSON(w, status, map[string]string{"error": err.Error()})
}
