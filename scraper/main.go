package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"scraper/internal/songmanager"
)

func main() {
	if len(os.Args) != 3 {
		fmt.Println("Usage: go run main.go \"<artist>\" \"<song>\"")
		return
	}
	artist := os.Args[1]
	song := os.Args[2]

	songsDir := filepath.Join("..", "songs")
	service, err := songmanager.NewService(songsDir)
	if err != nil {
		log.Fatalf("init song service: %v", err)
	}

	ctx := context.Background()
	detail, err := service.Download(ctx, songmanager.DownloadRequest{Artist: artist, Title: song})
	if err != nil {
		log.Fatalf("download failed: %v", err)
	}

	fmt.Printf("Downloaded %s - %s\n", detail.Summary.Artist, detail.Summary.Title)
	if detail.ChordsHTML != "" {
		fmt.Printf("Chords saved to %s\n", filepath.Join(songsDir, detail.Summary.ArtistSlug, detail.Summary.SongSlug, "chords.html"))
	}
	if detail.TabHTML != "" {
		fmt.Printf("Tab saved to %s\n", filepath.Join(songsDir, detail.Summary.ArtistSlug, detail.Summary.SongSlug, "tab.html"))
	}
}
