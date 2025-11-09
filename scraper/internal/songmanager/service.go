package songmanager

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
	"time"
	"unicode"

	"github.com/Pilfer/ultimate-guitar-scraper/pkg/render"
	"github.com/Pilfer/ultimate-guitar-scraper/pkg/ultimateguitar"
)

var (
	// ErrSongNotFound indicates a requested song directory does not exist.
	ErrSongNotFound = errors.New("song not found")
)

// Service performs song lookups, downloads, and metadata aggregation backed by the local songs directory.
type Service struct {
	songsDir      string
	repoRoot      string
	frontendDir   string
	songifyScript string
}

// NewService returns a Service rooted at the supplied songs directory path.
func NewService(songsDir string) (*Service, error) {
	if songsDir == "" {
		return nil, errors.New("songs directory must be provided")
	}
	if err := os.MkdirAll(songsDir, 0o755); err != nil {
		return nil, fmt.Errorf("ensure songs directory: %w", err)
	}
	repoRoot := filepath.Dir(songsDir)
	frontendDir := filepath.Join(repoRoot, "frontend")
	songifyScript := os.Getenv("SONGIFY_SCRIPT")
	if songifyScript == "" {
		songifyScript = filepath.Join(frontendDir, "scripts", "songify.ts")
	} else if !filepath.IsAbs(songifyScript) {
		songifyScript = filepath.Join(repoRoot, songifyScript)
	}
	if _, err := os.Stat(songifyScript); err != nil {
		songifyScript = ""
	}
	return &Service{
		songsDir:      songsDir,
		repoRoot:      repoRoot,
		frontendDir:   frontendDir,
		songifyScript: songifyScript,
	}, nil
}

// SavedSong summarises a locally stored song.
type SavedSong struct {
	Artist     string    `json:"artist"`
	ArtistSlug string    `json:"artistSlug"`
	Title      string    `json:"title"`
	SongSlug   string    `json:"songSlug"`
	Key        string    `json:"key"`
	HasChords  bool      `json:"hasChords"`
	HasTab     bool      `json:"hasTab"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

// SongDetail includes full saved song metadata plus file payloads ready for the frontend.
type SongDetail struct {
	Summary    SavedSong       `json:"summary"`
	ChordsHTML string          `json:"chordsHtml,omitempty"`
	TabHTML    string          `json:"tabHtml,omitempty"`
	SongJSON   json.RawMessage `json:"songJson,omitempty"`
}

// SearchQuery captures the user request the search results respond to.
type SearchQuery struct {
	Artist string `json:"artist"`
	Title  string `json:"title"`
}

// SearchResult summarises a UG tab search hit.
type SearchResult struct {
	ID     int64   `json:"id"`
	Title  string  `json:"title"`
	Artist string  `json:"artist"`
	Rating float64 `json:"rating"`
	Votes  int64   `json:"votes"`
	Score  float64 `json:"score"`
	Type   string  `json:"type"`
}

// SearchResponse groups chord and tab results separately to simplify the UI.
type SearchResponse struct {
	Query  SearchQuery    `json:"query"`
	Chords []SearchResult `json:"chords"`
	Tabs   []SearchResult `json:"tabs"`
}

// DownloadRequest instructs the service to fetch and persist chord/tab data for a song.
type DownloadRequest struct {
	Artist  string `json:"artist"`
	Title   string `json:"title"`
	ChordID int64  `json:"chordId,omitempty"`
	TabID   int64  `json:"tabId,omitempty"`
}

// ListSongs returns all saved songs in alphabetical order by artist then title.
func (s *Service) ListSongs(_ context.Context) ([]SavedSong, error) {
	artistDirs, err := os.ReadDir(s.songsDir)
	if err != nil {
		return nil, fmt.Errorf("read songs dir: %w", err)
	}

	songs := make([]SavedSong, 0)
	for _, artistEntry := range artistDirs {
		if !artistEntry.IsDir() {
			continue
		}

		artistSongs, err := s.scanArtistDirectory(artistEntry.Name())
		if err != nil {
			return nil, err
		}
		songs = append(songs, artistSongs...)
	}

	sortSongs(songs)
	return songs, nil
}

// GetSong loads chord/tab/html payloads for a saved song.
func (s *Service) GetSong(ctx context.Context, artistSlug, songSlug string) (SongDetail, error) {
	summary, err := s.readSummary(artistSlug, songSlug)
	if err != nil {
		if errors.Is(err, ErrSongNotFound) {
			return SongDetail{}, err
		}
		return SongDetail{}, fmt.Errorf("load song summary: %w", err)
	}

	basePath := s.songPath(artistSlug, songSlug)
	chordsHTML, tabHTML, songJSON := s.loadSongFiles(basePath)

	return SongDetail{
		Summary:    summary,
		ChordsHTML: chordsHTML,
		TabHTML:    tabHTML,
		SongJSON:   json.RawMessage(songJSON),
	}, nil
}

// Search queries Ultimate Guitar for chords and tabs matching the provided artist/title.
func (s *Service) Search(_ context.Context, artist, title string) (SearchResponse, error) {
	title = strings.TrimSpace(title)
	artist = strings.TrimSpace(artist)
	if title == "" {
		return SearchResponse{}, errors.New("title is required for search")
	}

	scraper := ultimateguitar.New()
	resp := SearchResponse{Query: SearchQuery{Artist: artist, Title: title}}

	chords, err := s.searchByType(scraper, artist, title, ultimateguitar.TabTypeChords)
	if err != nil {
		return SearchResponse{}, err
	}
	resp.Chords = chords

	tabs, err := s.searchByType(scraper, artist, title, ultimateguitar.TabTypeTabs)
	if err != nil {
		return SearchResponse{}, err
	}
	resp.Tabs = tabs

	return resp, nil
}

// Download fetches and stores chord/tab HTML for the provided song, creating directories as needed.
func (s *Service) Download(ctx context.Context, req DownloadRequest) (SongDetail, error) {
	artist := strings.TrimSpace(req.Artist)
	title := strings.TrimSpace(req.Title)

	if err := validateDownloadRequest(artist, title); err != nil {
		return SongDetail{}, err
	}

	scraper := ultimateguitar.New()
	chordID, tabID, err := s.resolveTabIDs(scraper, artist, title, req)
	if err != nil {
		return SongDetail{}, err
	}

	artistSlug := Slugify(artist)
	songSlug := Slugify(title)
	basePath := s.songPath(artistSlug, songSlug)

	if err := os.MkdirAll(basePath, 0o755); err != nil {
		return SongDetail{}, fmt.Errorf("mkdir song dir: %w", err)
	}

	if err := s.downloadTabs(ctx, scraper, basePath, chordID, tabID); err != nil {
		return SongDetail{}, err
	}

	return s.GetSong(ctx, artistSlug, songSlug)
}

// Delete removes a song from the library by deleting its directory.
func (s *Service) Delete(_ context.Context, artistSlug, songSlug string) error {
	basePath := s.songPath(artistSlug, songSlug)

	if _, err := os.Stat(basePath); os.IsNotExist(err) {
		return ErrSongNotFound
	}

	if err := os.RemoveAll(basePath); err != nil {
		return fmt.Errorf("delete song directory: %w", err)
	}

	// Check if artist directory is empty and remove it if so
	artistPath := filepath.Join(s.songsDir, artistSlug)
	entries, err := os.ReadDir(artistPath)
	if err == nil && len(entries) == 0 {
		_ = os.Remove(artistPath)
	}

	return nil
}

func (s *Service) fetchAndWriteTab(ctx context.Context, scraper ultimateguitar.Scraper, tabID int64, dest string) error {
	tabResult, err := scraper.GetTabByID(tabID)
	if err != nil {
		return fmt.Errorf("fetch tab %d: %w", tabID, err)
	}

	html, err := render.TabToHTML(tabResult)
	if err != nil {
		return fmt.Errorf("render tab %d: %w", tabID, err)
	}

	if err := os.WriteFile(dest, []byte(html), 0o644); err != nil {
		return fmt.Errorf("write tab %d to %s: %w", tabID, dest, err)
	}

	if strings.HasSuffix(dest, "chords.html") {
		if err := s.generateSongJSON(ctx, dest); err != nil {
			return err
		}
	}

	return nil
}

func (s *Service) searchByType(scraper ultimateguitar.Scraper, artist, title string, tabType ultimateguitar.TabType) ([]SearchResult, error) {
	params := ultimateguitar.SearchParams{
		Title: title,
		Type:  []ultimateguitar.TabType{tabType},
		Page:  1,
	}
	result, err := scraper.Search(params)
	if err != nil {
		return nil, fmt.Errorf("search %s: %w", strings.ToLower(tabTypeLabel(tabType)), err)
	}

	matches := make([]SearchResult, 0, len(result.Tabs))
	for _, tab := range result.Tabs {
		if artist != "" && !strings.EqualFold(string(tab.ArtistName), artist) {
			continue
		}
		score := tab.Rating
		if tab.Votes > 0 {
			score = tab.Rating * math.Log(float64(tab.Votes))
		}
		matches = append(matches, SearchResult{
			ID:     tab.ID,
			Title:  tab.SongName,
			Artist: string(tab.ArtistName),
			Rating: tab.Rating,
			Votes:  tab.Votes,
			Score:  score,
			Type:   string(tab.Type),
		})
	}

	sort.Slice(matches, func(i, j int) bool {
		if matches[i].Score == matches[j].Score {
			return matches[i].Rating > matches[j].Rating
		}
		return matches[i].Score > matches[j].Score
	})

	return matches, nil
}

func (s *Service) findBestTab(scraper ultimateguitar.Scraper, artist, title string, tabType ultimateguitar.TabType) (ultimateguitar.Tab, error) {
	results, err := s.searchByType(scraper, artist, title, tabType)
	if err != nil {
		return ultimateguitar.Tab{}, err
	}
	if len(results) == 0 {
		return ultimateguitar.Tab{}, fmt.Errorf("no %s results for %s - %s", strings.ToLower(tabTypeLabel(tabType)), artist, title)
	}

	// searchByType already sorts by score, so the first entry is best.
	best := results[0]
	return ultimateguitar.Tab{ID: best.ID, SongName: best.Title, ArtistName: ultimateguitar.ArtistName(best.Artist)}, nil
}

func (s *Service) readSummary(artistSlug, songSlug string) (SavedSong, error) {
	basePath := s.songPath(artistSlug, songSlug)
	if _, err := os.Stat(basePath); os.IsNotExist(err) {
		return SavedSong{}, ErrSongNotFound
	}

	summary := SavedSong{
		ArtistSlug: artistSlug,
		SongSlug:   songSlug,
		Artist:     UnsanitizeName(artistSlug),
		Title:      UnsanitizeName(songSlug),
	}

	chordsPath := filepath.Join(basePath, "chords.html")
	if info, err := os.Stat(chordsPath); err == nil {
		summary.HasChords = true
		summary.UpdatedAt = newest(summary.UpdatedAt, info.ModTime())
	}

	tabPath := filepath.Join(basePath, "tab.html")
	if info, err := os.Stat(tabPath); err == nil {
		summary.HasTab = true
		summary.UpdatedAt = newest(summary.UpdatedAt, info.ModTime())
	}

	songJSONPath := filepath.Join(basePath, "song.json")
	if info, err := os.Stat(songJSONPath); err == nil {
		summary.UpdatedAt = newest(summary.UpdatedAt, info.ModTime())
		if data, readErr := os.ReadFile(songJSONPath); readErr == nil {
			var payload struct {
				Title  string `json:"title"`
				Artist string `json:"artist"`
				Key    string `json:"key"`
			}
			if jsonErr := json.Unmarshal(data, &payload); jsonErr == nil {
				if payload.Title != "" {
					summary.Title = payload.Title
				}
				if payload.Artist != "" {
					summary.Artist = payload.Artist
				}
				if payload.Key != "" {
					summary.Key = payload.Key
				}
			}
		}
	}

	return summary, nil
}

func (s *Service) songPath(artistSlug, songSlug string) string {
	return filepath.Join(s.songsDir, artistSlug, songSlug)
}

// Slugify mirrors the CLI logic for normalising folder names.
func Slugify(input string) string {
	sanitized := strings.ReplaceAll(strings.TrimSpace(input), " ", "_")
	var builder strings.Builder
	lastUnderscore := false
	for _, r := range sanitized {
		switch {
		case r >= 'a' && r <= 'z', r >= 'A' && r <= 'Z', r >= '0' && r <= '9':
			builder.WriteRune(r)
			lastUnderscore = false
		case r == '_' || r == '-':
			if r == '_' {
				if lastUnderscore {
					continue
				}
				lastUnderscore = true
			} else {
				lastUnderscore = false
			}
			builder.WriteRune(r)
		default:
			if !lastUnderscore {
				builder.WriteRune('_')
				lastUnderscore = true
			}
		}
	}
	result := strings.Trim(builder.String(), "_")
	if result == "" {
		return "song"
	}
	return result
}

// UnsanitizeName provides a readable label from a slug.
func UnsanitizeName(slug string) string {
	if slug == "" {
		return slug
	}
	replaced := strings.ReplaceAll(slug, "_", " ")
	words := strings.Fields(replaced)
	for i, word := range words {
		runes := []rune(strings.ToLower(word))
		if len(runes) == 0 {
			continue
		}
		runes[0] = unicode.ToUpper(runes[0])
		words[i] = string(runes)
	}
	return strings.Join(words, " ")
}

func newest(current time.Time, candidate time.Time) time.Time {
	if current.IsZero() || candidate.After(current) {
		return candidate
	}
	return current
}

func tabTypeLabel(tabType ultimateguitar.TabType) string {
	switch tabType {
	case ultimateguitar.TabTypeChords:
		return "Chords"
	case ultimateguitar.TabTypeTabs:
		return "Tabs"
	case ultimateguitar.TabTypeBass:
		return "Bass"
	case ultimateguitar.TabTypeUkulele:
		return "Ukulele"
	case ultimateguitar.TabTypeVideo:
		return "Video"
	case ultimateguitar.TabTypePro:
		return "Official"
	default:
		return "Unknown"
	}
}

func (s *Service) generateSongJSON(ctx context.Context, chordsPath string) error {
	if s.songifyScript == "" {
		return nil
	}

	outputPath := filepath.Join(filepath.Dir(chordsPath), "song.json")

	cmd := exec.CommandContext(ctx, "npx", "--yes", "--no-install", "tsx", s.songifyScript, chordsPath, outputPath)
	if s.frontendDir != "" {
		cmd.Dir = s.frontendDir
	}
	cmd.Env = os.Environ()

	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("songify %s: %w (%s)", filepath.Base(chordsPath), err, strings.TrimSpace(stderr.String()))
	}

	return nil
}
