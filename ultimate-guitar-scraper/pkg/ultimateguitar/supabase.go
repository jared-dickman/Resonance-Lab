package ultimateguitar

import (
	"context"
	"log"

	supa "github.com/nedpals/supabase-go"
)

// Song represents the structure of a song to be stored in Supabase
type Song struct {
	ID         int64  `json:"id"`
	TabID      int64  `json:"tab_id"`
	SongName   string `json:"song_name"`
	ArtistName string `json:"artist_name"`
	Content    string `json:"content"`
}

// SupabaseClient holds the Supabase client instance
type SupabaseClient struct {
	client *supa.Client
}

// NewSupabaseClient creates and returns a new Supabase client
func NewSupabaseClient(supabaseURL, supabaseKey string) *SupabaseClient {
	return &SupabaseClient{
		client: supa.CreateClient(supabaseURL, supabaseKey),
	}
}

// InsertSong inserts a song into the Supabase 'songs' table
func (s *SupabaseClient) InsertSong(ctx context.Context, song Song) error {
	var results []Song
	err := s.client.DB.From("songs").Insert(song).Execute(&results)
	if err != nil {
		log.Printf("Error inserting song into Supabase: %v", err)
		return err
	}
	log.Printf("Successfully inserted song: %s by %s (TabID: %d) into Supabase", song.SongName, song.ArtistName, song.TabID)
	return nil
}
