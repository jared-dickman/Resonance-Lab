"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { RefreshCcw } from "lucide-react"
import type { Metadata } from "next";
import "./globals.css";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import QueryProvider from "@/lib/QueryProvider";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { listSavedSongs } from "@/lib/api"
import type { SavedSong } from "@/lib/types"

interface StatusMessage {
  type: "success" | "error" | "info"
  message: string
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [songs, setSongs] = useState<SavedSong[]>([])
  const [isLoadingSongs, setIsLoadingSongs] = useState(false)
  const [status, setStatus] = useState<StatusMessage | null>(null)

  useEffect(() => {
    refreshSongs()
  }, [])

  const refreshSongs = async () => {
    try {
      setIsLoadingSongs(true)
      const data = await listSavedSongs()
      setSongs(data)
    } catch (error) {
      console.error(error)
      setStatus({ type: "error", message: getErrorMessage(error) })
    } finally {
      setIsLoadingSongs(false)
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
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <div className="min-h-screen bg-background">
            <header className="border-b">
              <div className="container flex flex-col gap-2 py-6">
                <h1 className="text-2xl font-semibold tracking-tight">Resonance Lab</h1>
                <p className="text-sm text-muted-foreground">
                  Manage saved songs and pull fresh chords from Ultimate Guitar using the Go backend.
                </p>
              </div>
            </header>
            <div className="container mx-auto p-4">
              <Breadcrumbs />
            </div>
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
                                  return (
                                    <Link
                                      href={`/songs/${song.artistSlug}/${song.songSlug}`}
                                      key={`${song.artistSlug}-${song.songSlug}`}
                                      className={`w-full rounded-md border px-3 py-2 text-left text-sm transition hover:border-primary hover:bg-muted border-transparent`}
                                    >
                                      <div className="font-medium">{song.title}</div>
                                      <div className="text-xs text-muted-foreground">Updated {new Date(song.updatedAt).toLocaleDateString()}</div>
                                    </Link>
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
              </div>
              <div className="min-h-[32rem]">
                {children}
              </div>
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return "Unexpected error"
}