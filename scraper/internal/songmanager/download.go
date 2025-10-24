package songmanager

import (
	"context"
	"errors"
	"fmt"
	"path/filepath"

	"github.com/Pilfer/ultimate-guitar-scraper/pkg/ultimateguitar"
)

func (s *Service) resolveTabIDs(scraper ultimateguitar.Scraper, artist, title string, req DownloadRequest) (chordID, tabID int64, err error) {
	chordID = req.ChordID
	if chordID == 0 {
		tab, err := s.findBestTab(scraper, artist, title, ultimateguitar.TabTypeChords)
		if err != nil {
			return 0, 0, fmt.Errorf("resolve chord tab: %w", err)
		}
		chordID = tab.ID
	}

	tabID = req.TabID
	if tabID == 0 {
		tab, err := s.findBestTab(scraper, artist, title, ultimateguitar.TabTypeTabs)
		if err == nil {
			tabID = tab.ID
		}
	}

	return chordID, tabID, nil
}

func (s *Service) downloadTabs(ctx context.Context, scraper ultimateguitar.Scraper, basePath string, chordID, tabID int64) error {
	if chordID > 0 {
		chordsPath := filepath.Join(basePath, "chords.html")
		if err := s.fetchAndWriteTab(ctx, scraper, chordID, chordsPath); err != nil {
			return err
		}
	}

	if tabID > 0 {
		tabPath := filepath.Join(basePath, "tab.html")
		if err := s.fetchAndWriteTab(ctx, scraper, tabID, tabPath); err != nil {
			return err
		}
	}

	return nil
}

func validateDownloadRequest(artist, title string) error {
	if artist == "" || title == "" {
		return errors.New("both artist and title are required")
	}
	return nil
}
