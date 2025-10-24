"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { listSavedSongs } from "@/lib/api"
import { useAsyncApi } from "@/lib/hooks"
import type { SavedSong } from "@/lib/types"

interface SongsContextType {
  songs: SavedSong[]
  isLoadingSongs: boolean
  refreshSongs: () => Promise<void>
  error: string | null
}

const SongsContext = createContext<SongsContextType | undefined>(undefined)

export function SongsProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)
  const { data, isLoading, error, execute } = useAsyncApi(
    listSavedSongs,
    "Failed to load songs"
  )

  const refreshSongs = async () => {
    await execute()
  }

  useEffect(() => {
    setIsMounted(true)
    refreshSongs()
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <SongsContext.Provider
      value={{
        songs: data ?? [],
        isLoadingSongs: isLoading,
        refreshSongs,
        error,
      }}
    >
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