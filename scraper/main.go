package main

import (
	"fmt"
	"log"
	"math"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/Pilfer/ultimate-guitar-scraper/pkg/ultimateguitar"
)

func main() {
	if len(os.Args) != 3 {
		fmt.Println("Usage: go run main.go \"<artist>\" \"<song>\"")
		return
	}
	artist := os.Args[1]
	song := os.Args[2]

	scraper := ultimateguitar.New()

	// Search for "Chords"
	searchParamsChords := ultimateguitar.SearchParams{
		Title: song,
		Type:  []ultimateguitar.TabType{ultimateguitar.TabTypeChords},
	}
	searchResultsChords, err := scraper.Search(searchParamsChords)
	if err != nil {
		log.Fatal(err)
	}

	var bestChord ultimateguitar.Tab
	var maxChordScore float64

	for _, tab := range searchResultsChords.Tabs {
		if strings.ToLower(string(tab.ArtistName)) != strings.ToLower(artist) {
			continue
		}
		if tab.Votes == 0 {
			continue
		}
		score := tab.Rating * math.Log(float64(tab.Votes))
		if score > maxChordScore {
			maxChordScore = score
			bestChord = tab
		}
	}

	if bestChord.ID == 0 {
		fmt.Println("No chords found for this song and artist.")
	} else {
		fmt.Printf("Best Chord ID: %d\n", bestChord.ID)
		downloadTab(bestChord.ID, artist, song, "chords")
	}

	// Search for "Tabs"
	searchParamsTabs := ultimateguitar.SearchParams{
		Title: song,
		Type:  []ultimateguitar.TabType{ultimateguitar.TabTypeTabs},
	}
	searchResultsTabs, err := scraper.Search(searchParamsTabs)
	if err != nil {
		log.Fatal(err)
	}

	var bestTab ultimateguitar.Tab
	var maxTabScore float64

	for _, tab := range searchResultsTabs.Tabs {
		if strings.ToLower(string(tab.ArtistName)) != strings.ToLower(artist) {
			continue
		}
		if tab.Votes == 0 {
			continue
		}
		score := tab.Rating * math.Log(float64(tab.Votes))
		if score > maxTabScore {
			maxTabScore = score
			bestTab = tab
		}
	}

	if bestTab.ID == 0 {
		fmt.Println("No tabs found for this song and artist.")
	} else {
		fmt.Printf("Best Tab ID: %d\n", bestTab.ID)
		downloadTab(bestTab.ID, artist, song, "tab")
	}
}

func downloadTab(id int64, artist, song, tabType string) {
	scraperPath := filepath.Join("..", "ultimate-guitar-scraper", "ultimate-guitar-scraper")
	fileName := fmt.Sprintf("%s_%s_%s.html", strings.ReplaceAll(artist, " ", "_"), strings.ReplaceAll(song, " ", "_"), tabType)
	filePath := filepath.Join("..", fileName)

	cmd := exec.Command(scraperPath, "export", "--id", fmt.Sprintf("%d", id))
	output, err := cmd.Output()
	if err != nil {
		log.Fatal(err)
	}

	err = os.WriteFile(filePath, output, 0644)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Successfully downloaded %s to %s\n", tabType, filePath)
}
