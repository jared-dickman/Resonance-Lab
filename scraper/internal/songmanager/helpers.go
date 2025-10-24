package songmanager

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
)

func (s *Service) scanArtistDirectory(artistSlug string) ([]SavedSong, error) {
	artistPath := filepath.Join(s.songsDir, artistSlug)
	songEntries, err := os.ReadDir(artistPath)
	if err != nil {
		return nil, fmt.Errorf("read artist dir %s: %w", artistSlug, err)
	}

	songs := make([]SavedSong, 0, len(songEntries))
	for _, songEntry := range songEntries {
		if !songEntry.IsDir() {
			continue
		}

		summary, err := s.readSummary(artistSlug, songEntry.Name())
		if err != nil {
			continue
		}
		songs = append(songs, summary)
	}

	return songs, nil
}

func sortSongs(songs []SavedSong) {
	sort.Slice(songs, func(i, j int) bool {
		if songs[i].Artist == songs[j].Artist {
			return songs[i].Title < songs[j].Title
		}
		return songs[i].Artist < songs[j].Artist
	})
}

func (s *Service) loadSongFiles(basePath string) (chordsHTML, tabHTML string, songJSON []byte) {
	if data, err := os.ReadFile(filepath.Join(basePath, "chords.html")); err == nil {
		chordsHTML = string(data)
	}
	if data, err := os.ReadFile(filepath.Join(basePath, "tab.html")); err == nil {
		tabHTML = string(data)
	}
	if data, err := os.ReadFile(filepath.Join(basePath, "song.json")); err == nil {
		songJSON = data
	}
	return
}
