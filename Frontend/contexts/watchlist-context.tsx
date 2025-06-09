"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface Movie {
  id: number
  title: string
  poster_path: string
  overview: string
  release_date: string
  vote_average: number
}

interface WatchlistContextType {
  watchlist: Movie[]
  addToWatchlist: (movie: Movie) => void
  removeFromWatchlist: (id: number) => void
  isInWatchlist: (id: number) => boolean
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined)

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<Movie[]>([])

  const addToWatchlist = (movie: Movie) => {
    setWatchlist((prev) => {
      if (prev.find((m) => m.id === movie.id)) return prev
      return [...prev, movie]
    })
  }

  const removeFromWatchlist = (id: number) => {
    setWatchlist((prev) => prev.filter((movie) => movie.id !== id))
  }

  const isInWatchlist = (id: number) => {
    return watchlist.some((movie) => movie.id === id)
  }

  return (
    <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlist() {
  const context = useContext(WatchlistContext)
  if (context === undefined) {
    throw new Error("useWatchlist must be used within a WatchlistProvider")
  }
  return context
}
