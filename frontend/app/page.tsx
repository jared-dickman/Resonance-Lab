"use client"

import { type FormEvent, useEffect, useMemo, useState } from "react"
import { Download, RefreshCcw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { downloadSong, fetchSongDetail, listSavedSongs, searchLibrary } from "@/lib/api"
import type { SavedSong, SearchResult, SearchResponse, SongDetail } from "@/lib/types"

interface StatusMessage {
  type: "success" | "error" | "info"
  message: string
}

export default function HomePage() {
  const [songs, setSongs] = useState<SavedSong[]>([])
  const [selectedSummary, setSelectedSummary] = useState<SavedSong | null>(null)
  const [songDetail, setSongDetail] = useState<SongDetail | null>(null)

  const [isLoadingSongs, setIsLoadingSongs] = useState(false)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const [status, setStatus] = useState<StatusMessage | null>(null)

  const [searchArtist, setSearchArtist] = useState("")
  const [searchTitle, setSearchTitle] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
  const [selectedChord, setSelectedChord] = useState<SearchResult | null>(null)
  const [selectedTab, setSelectedTab] = useState<SearchResult | null>(null)

  useEffect(() => {
    refreshSongs()
  }, [])

  useEffect(() => {
    if (selectedSummary) {
      loadSongDetail(selectedSummary.artistSlug, selectedSummary.songSlug)
    }
  }, [selectedSummary?.artistSlug, selectedSummary?.songSlug])

  const refreshSongs = async () => {
    try {
      setIsLoadingSongs(true)
      const data = await listSavedSongs()
      setSongs(data)
      if (data.length && !selectedSummary) {
        setSelectedSummary(data[0])
      }
    } catch (error) {
      console.error(error)
      setStatus({ type: "error", message: getErrorMessage(error) })
    } finally {
      setIsLoadingSongs(false)
    }
  }

  const loadSongDetail = async (artistSlug: string, songSlug: string) => {
    try {
      setIsLoadingDetail(true)
      const detail = await fetchSongDetail(artistSlug, songSlug)
      setSongDetail(detail)
      setStatus(null)
    } catch (error) {
      console.error(error)
      setStatus({ type: "error", message: `Unable to load song: ${getErrorMessage(error)}` })
    } finally {
      setIsLoadingDetail(false)
    }
  }

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
      setSongDetail(detail)
      setSelectedSummary(detail.summary)
      const updatedSongs = await listSavedSongs()
      setSongs(updatedSongs)
    } catch (error) {
      console.error(error)
      setStatus({ type: "error", message: `Download failed: ${getErrorMessage(error)}` })
    } finally {
      setIsDownloading(false)
    }
  }

  const groupedSongs = useMemo(() => {
    const groups = new Map<string, SavedSong[]>()
    songs.forEach((song) => {
      const existing = groups.get(song.artist) || []
      existing.push(song)
      groups.set(song.artist, existing)
    })
    return Array.from(groups.entries()).map(([artist, items]) => ({
      artist,
      items: items.sort((a, b) => a.title.localeCompare(b.title))
    }))
  }, [songs])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex flex-col gap-2 py-6">
          <h1 className="text-2xl font-semibold tracking-tight">Resonance Lab</h1>
          <p className="text-sm text-muted-foreground">
            Manage saved songs and pull fresh chords from Ultimate Guitar using the Go backend.
          </p>
        </div>
      </header>
      <main className="container grid gap-6 py-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Saved Songs</CardTitle>
                <CardDescription>Choose a song to view its chords and tab.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={refreshSongs} disabled={isLoadingSongs}>
                {isLoadingSongs ? <Spinner /> : <RefreshCcw className="h-4 w-4" />}
                <span className="sr-only">Refresh songs</span>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-[28rem] pr-4">
                {songs.length === 0 && !isLoadingSongs ? (
                  <p className="text-sm text-muted-foreground">No songs saved yet. Use the search below to add one.</p>
                ) : (
                  <div className="space-y-4">
                    {groupedSongs.map(({ artist, items }) => (
                      <div key={artist} className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground">{artist}</h3>
                        <div className="space-y-2">
                          {items.map((song) => {
                            const isActive = selectedSummary?.artistSlug === song.artistSlug && selectedSummary?.songSlug === song.songSlug
                            return (
                              <button
                                key={`${song.artistSlug}-${song.songSlug}`}
                                onClick={() => setSelectedSummary(song)}
                                className={`w-full rounded-md border px-3 py-2 text-left text-sm transition hover:border-primary hover:bg-muted ${
                                  isActive ? "border-primary bg-muted" : "border-transparent"
                                }`}
                              >
                                <div className="font-medium">{song.title}</div>
                                <div className="text-xs text-muted-foreground">Updated {new Date(song.updatedAt).toLocaleDateString()}</div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

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

        <Card className="min-h-[32rem]">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">{songDetail?.summary.title ?? "Song Viewer"}</CardTitle>
            <CardDescription>
              {songDetail ? `Artist: ${songDetail.summary.artist}` : "Select a saved song to view its details."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {status && (
              <div
                className={`rounded-md border px-4 py-3 text-sm ${
                  status.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : status.type === "error"
                    ? "border-rose-200 bg-rose-50 text-rose-800"
                    : "border-sky-200 bg-sky-50 text-sky-800"
                }`}
              >
                {status.message}
              </div>
            )}

            {isLoadingDetail && (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                <Spinner className="h-6 w-6" />
              </div>
            )}

            {!isLoadingDetail && songDetail && (
              <Tabs defaultValue={songDetail.chordsHtml ? "chords" : songDetail.tabHtml ? "tab" : "info"}>
                <TabsList>
                  {songDetail.chordsHtml && <TabsTrigger value="chords">Chords</TabsTrigger>}
                  {songDetail.tabHtml && <TabsTrigger value="tab">Tab</TabsTrigger>}
                  <TabsTrigger value="info">Info</TabsTrigger>
                </TabsList>
                {songDetail.chordsHtml && (
                  <TabsContent value="chords" className="space-y-4">
                    <HtmlPanel html={songDetail.chordsHtml} />
                  </TabsContent>
                )}
                {songDetail.tabHtml && (
                  <TabsContent value="tab" className="space-y-4">
                    <HtmlPanel html={songDetail.tabHtml} />
                  </TabsContent>
                )}
                <TabsContent value="info" className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Artist:</span> {songDetail.summary.artist}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Title:</span> {songDetail.summary.title}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Updated:</span>{" "}
                    {new Date(songDetail.summary.updatedAt).toLocaleString()}
                  </p>
                  {!songDetail.chordsHtml && !songDetail.tabHtml && <p>No chord or tab HTML saved yet.</p>}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </main>
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

function HtmlPanel({ html }: { html: string }) {
  return (
    <div className="scrollbar-thin max-h-[560px] overflow-auto rounded-md border bg-card p-4 text-sm">
      <div className="song-html space-y-2" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return "Unexpected error"
}
