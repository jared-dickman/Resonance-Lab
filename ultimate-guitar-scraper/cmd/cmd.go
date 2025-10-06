package cmd

import (
	"log"

	"github.com/joho/godotenv"
	"github.com/urfave/cli"
)

// BeforeCommand sets the global flags before any commands are run
func BeforeCommand(c *cli.Context) error {
	// Load .env file if it exists
	err := godotenv.Load("../.env")
	if err != nil {
		log.Println("No .env file found in project root or error loading .env file:", err)
	}
	return nil
}

// AfterCommand sets the global flags before any commands are run
func AfterCommand(c *cli.Context) error {
	return nil
}
