export interface SavedSong {
  artist: string
  artistSlug: string
  title: string
  songSlug: string
  hasChords: boolean
  hasTab: boolean
  updatedAt: string
}

export interface SongDetail {
  summary: SavedSong
  chordsHtml?: string
  tabHtml?: string
  songJson?: unknown
}

export interface SearchResult {
  id: number
  title: string
  artist: string
  rating: number
  votes: number
  score: number
  type: string
}

export interface SearchResponse {
  query: {
    artist: string
    title: string
  }
  chords: SearchResult[]
  tabs: SearchResult[]
}

export interface DownloadRequest {
  artist: string
  title: string
  chordId?: number
  tabId?: number
}
