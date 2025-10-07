"use client"

import { type FormEvent, useState } from "react"
import { Download, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { downloadSong, listSavedSongs, searchLibrary } from "@/lib/api"
import type { SavedSong, SearchResult, SearchResponse } from "@/lib/types"

interface StatusMessage {
  type: "success" | "error" | "info"
  message: string
}

export default function HomePage() {
  const [isSearching, setIsSearching] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const [status, setStatus] = useState<StatusMessage | null>(null)

  const [searchArtist, setSearchArtist] = useState("")
  const [searchTitle, setSearchTitle] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
  const [selectedChord, setSelectedChord] = useState<SearchResult | null>(null)
  const [selectedTab, setSelectedTab] = useState<SearchResult | null>(null)

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault()
    if (!searchTitle.trim()) {
      setStatus({ type: "error", message: "Song title is required for search." })
      return
    }
    try {
      setIsSearching(true)
      setStatus({ type: "info", message: "Searching Ultimate Guitar..." })
      const results = await searchLibrary(searchArtist.trim(), searchTitle.trim())
      setSearchResults(results)
      setSelectedChord(null)
      setSelectedTab(null)
      if (!results.chords.length && !results.tabs.length) {
        setStatus({ type: "info", message: "No results found. Try a different query." })
      } else {
        setStatus(null)
      }
    } catch (error) {
      console.error(error)
      setStatus({ type: "error", message: `Search failed: ${getErrorMessage(error)}` })
    } finally {
      setIsSearching(false)
    }
  }

  const handleDownload = async () => {
    if (!searchTitle.trim() && !selectedChord && !selectedTab) {
      setStatus({ type: "error", message: "Provide a search query and select at least a chord result." })
      return
    }

    const artist = selectedChord?.artist || selectedTab?.artist || searchArtist.trim()
    const title = selectedChord?.title || selectedTab?.title || searchTitle.trim()

    if (!artist || !title) {
      setStatus({ type: "error", message: "Select a chord result or provide both artist and title." })
      return
    }

    try {
      setIsDownloading(true)
      setStatus({ type: "info", message: "Downloading song and saving locally..." })
      const detail = await downloadSong({
        artist,
        title,
        chordId: selectedChord?.id,
        tabId: selectedTab?.id
      })
      setStatus({ type: "success", message: `${detail.summary.title} saved successfully.` })
      // No need to update songs here, as the layout will handle refreshing its own song list
      // const updatedSongs = await listSavedSongs()
      // setSongs(updatedSongs)
    } catch (error) {
      console.error(error)
      setStatus({ type: "error", message: `Download failed: ${getErrorMessage(error)}` })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Ultimate Guitar</CardTitle>
          <CardDescription>Pick a chord and optional tab to import into your library.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSearch}>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="artist">
                Artist
              </label>
              <Input
                id="artist"
                placeholder="e.g. Ben E. King"
                value={searchArtist}
                onChange={(event) => setSearchArtist(event.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="title">
                Song Title
              </label>
              <Input
                id="title"
                placeholder="e.g. Stand By Me"
                value={searchTitle}
                onChange={(event) => setSearchTitle(event.target.value)}
                required
                autoComplete="off"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSearching}>
              {isSearching ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  Searching...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </span>
              )}
            </Button>
          </form>

          {searchResults && (
            <div className="mt-6 space-y-4">
              <ResultList
                title="Chord Charts"
                results={searchResults.chords}
                selected={selectedChord?.id}
                onSelect={setSelectedChord}
              />
              <ResultList
                title="Tabs"
                results={searchResults.tabs}
                selected={selectedTab?.id}
                onSelect={setSelectedTab}
              />
              <Button
                className="w-full"
                variant="secondary"
                onClick={handleDownload}
                disabled={isDownloading || (!selectedChord && !selectedTab)}
              >
                {isDownloading ? (
                  <span className="flex items-center gap-2">
                    <Spinner />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Selection
                  </span>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ResultList({
  title,
  results,
  selected,
  onSelect
}: {
  title: string
  results: SearchResult[]
  selected: number | null | undefined
  onSelect: (result: SearchResult | null) => void
}) {
  if (!results.length) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase text-muted-foreground">{title}</div>
      <div className="space-y-2">
        {results.map((result) => {
          const isActive = selected === result.id
          return (
            <button
              key={result.id}
              onClick={() => onSelect(isActive ? null : result)}
              className={`w-full rounded-md border px-3 py-2 text-left text-sm transition hover:border-primary hover:bg-muted ${
                isActive ? "border-primary bg-muted" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{result.title}</span>
                <span className="text-xs text-muted-foreground">{result.artist}</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Rating {result.rating.toFixed(1)} • Votes {result.votes} • Score {result.score.toFixed(2)}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return "Unexpected error"
}