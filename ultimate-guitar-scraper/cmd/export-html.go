package cmd

import (
	"fmt"
	"log"

	"github.com/Pilfer/ultimate-guitar-scraper/pkg/render"
	"github.com/Pilfer/ultimate-guitar-scraper/pkg/ultimateguitar"

	"github.com/urfave/cli"
)

var ExportTabHTML = cli.Command{
	Name:        "export",
	Usage:       "ug export -id {tabId}",
	Description: "Fetch a tab from ultimate-guitar.com by id and print it as HTML",
	Aliases:     []string{"e"},
	Flags: []cli.Flag{
		cli.Int64Flag{
			Name:  "id",
			Value: 1086983,
			Usage: "",
		},
	},
	Action: exportTabByID,
}

func exportTabByID(c *cli.Context) {
	var tabID int64

	if c.IsSet("id") {
		tabID = c.Int64("id")
	}

	s := ultimateguitar.New()
	tab, err := s.GetTabByID(tabID)

	if err != nil {
		log.Fatal(err)
	}

	html, err := render.TabToHTML(tab)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(html)
}
