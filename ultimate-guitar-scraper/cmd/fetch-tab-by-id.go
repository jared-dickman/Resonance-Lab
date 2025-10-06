package cmd

import (
	"context"
	"fmt"
	"log"
	"strings"

	"github.com/Pilfer/ultimate-guitar-scraper/pkg/ultimateguitar"
	"github.com/urfave/cli"
)

var FetchTab = cli.Command{
	Name:        "fetch",
	Usage:       "ug f -id {tabId}",
	Description: "Fetch a tab from ultimate-guitar.com by id",
	Aliases:     []string{"f"},
	Flags: []cli.Flag{
		cli.Int64Flag{
			Name:  "id",
			Value: 1947141,
			Usage: "",
		},
		cli.StringFlag{
			Name:   "supabase-url",
			Usage:  "Supabase URL for storing data",
			EnvVar: "SUPABASE_URL",
		},
		cli.StringFlag{
			Name:   "supabase-key",
			Usage:  "Supabase API Key for storing data",
			EnvVar: "SUPABASE_KEY",
		},
	},
	Action: fetchTabByID,
}

func fetchTabByID(c *cli.Context) {
	var tabID int64

	if c.IsSet("id") {
		tabID = c.Int64("id")
	}

	s := ultimateguitar.New()
	tab, err := s.GetTabByID(tabID)

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("----------------------------------------------------------------------")
	fmt.Println("Song name:", tab.SongName, " by ", tab.ArtistName)
	fmt.Println("----------------------------------------------------------------------")

	// Remove the syntax delimiters as a proof of concept
	tabOut := strings.ReplaceAll(tab.Content, "[tab]", "")
	tabOut = strings.ReplaceAll(tabOut, "[/tab]", "")
	tabOut = strings.ReplaceAll(tabOut, "[ch]", "")
	tabOut = strings.ReplaceAll(tabOut, "[/ch]", "")
	fmt.Println(tabOut)

	// Supabase Integration
	supabaseURL := c.String("supabase-url")
	supabaseKey := c.String("supabase-key")

	if supabaseURL == "" || supabaseKey == "" {
		log.Println("Supabase URL or Key not provided. Skipping Supabase storage.")
		return
	}

	supabaseClient := ultimateguitar.NewSupabaseClient(supabaseURL, supabaseKey)

	song := ultimateguitar.Song{
		TabID:      tabID,
		SongName:   tab.SongName,
		ArtistName: tab.ArtistName,
		Content:    tab.Content,
	}

	err = supabaseClient.InsertSong(context.Background(), song)
	if err != nil {
		log.Printf("Failed to save song to Supabase: %v", err)
	}
}
