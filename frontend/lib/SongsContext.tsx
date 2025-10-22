"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { listSavedSongs } from "@/lib/api"
import type { SavedSong } from "@/lib/types"

interface SongsContextType {
  songs: SavedSong[]
  isLoadingSongs: boolean
  refreshSongs: () => Promise<void>
  error: string | null
}

const SongsContext = createContext<SongsContextType | undefined>(undefined)

export function SongsProvider({ children }: { children: ReactNode }) {
  const [songs, setSongs] = useState<SavedSong[]>([])
  const [isLoadingSongs, setIsLoadingSongs] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  const refreshSongs = useCallback(async () => {
    try {
      setIsLoadingSongs(true)
      setError(null)
      const data = await listSavedSongs()
      setSongs(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load songs"
      setError(message)
    } finally {
      setIsLoadingSongs(false)
    }
  }, [])

  useEffect(() => {
    setIsMounted(true)
    refreshSongs()
  }, [refreshSongs])

  if (!isMounted) {
    return null
  }

  return (
    <SongsContext.Provider value={{ songs, isLoadingSongs, refreshSongs, error }}>
      {children}
    </SongsContext.Provider>
  )
}

export function useSongs() {
  const context = useContext(SongsContext)
  if (context === undefined) {
    throw new Error("useSongs must be used within a SongsProvider")
  }
  return context
}