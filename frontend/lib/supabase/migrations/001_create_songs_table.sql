-- Songs table for Jamium
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist TEXT NOT NULL,
  artist_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  song_slug TEXT NOT NULL,
  key TEXT,
  album TEXT,
  original_key TEXT,
  performer TEXT,
  capo TEXT,
  source_url TEXT,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  has_chords BOOLEAN NOT NULL DEFAULT true,
  has_tab BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Unique constraint for upsert
  CONSTRAINT songs_artist_song_unique UNIQUE (artist_slug, song_slug)
);

-- Index for listing non-deleted songs
CREATE INDEX IF NOT EXISTS songs_deleted_at_idx ON songs (deleted_at) WHERE deleted_at IS NULL;

-- Index for ordering by updated_at
CREATE INDEX IF NOT EXISTS songs_updated_at_idx ON songs (updated_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated service role
CREATE POLICY "Service role full access" ON songs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON songs TO authenticated;
GRANT ALL ON songs TO service_role;
