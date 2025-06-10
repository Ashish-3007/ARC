"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { VideoQuality } from "@/lib/pricing"

export interface LibraryItem {
  id: number
  title: string
  poster_path: string
  type: "rent" | "buy"
  purchaseDate: string
  expiryDate?: string
  quality: VideoQuality
  price: number
}

interface LibraryContextType {
  items: LibraryItem[]
  addToLibrary: (item: Omit<LibraryItem, "purchaseDate">) => void
  removeFromLibrary: (id: number, quality: VideoQuality, type: "rent" | "buy") => void
  isInLibrary: (id: number) => boolean
  getLibraryItem: (id: number) => LibraryItem | undefined
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined)

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<LibraryItem[]>([])

  // Load library from localStorage on mount
  useEffect(() => {
    const storedLibrary = localStorage.getItem("arc_library")
    if (storedLibrary) {
      try {
        setItems(JSON.parse(storedLibrary))
      } catch (error) {
        console.error("Failed to parse library data:", error)
      }
    }
  }, [])

  // Save library to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("arc_library", JSON.stringify(items))
  }, [items])

  const addToLibrary = (item: Omit<LibraryItem, "purchaseDate">) => {
    const purchaseDate = new Date().toISOString()

    // Calculate expiry date for rentals
    let expiryDate: string | undefined = undefined
    if (item.type === "rent") {
      const expiry = new Date()
      switch (item.duration) {
        case "24h":
          expiry.setHours(expiry.getHours() + 24)
          break
        case "7d":
          expiry.setDate(expiry.getDate() + 7)
          break
        case "1mo":
          expiry.setMonth(expiry.getMonth() + 1)
          break
      }
      expiryDate = expiry.toISOString()
    }

    setItems((prev) => {
      // Check if item already exists
      const existingItem = prev.find((i) => i.id === item.id && i.quality === item.quality && i.type === item.type)

      if (existingItem) {
        // If it's a rental, update the expiry date
        if (item.type === "rent" && expiryDate) {
          return prev.map((i) =>
            i.id === item.id && i.quality === item.quality && i.type === item.type
              ? { ...i, expiryDate, purchaseDate }
              : i,
          )
        }
        return prev
      }

      // Add new item
      return [...prev, { ...item, purchaseDate, expiryDate }]
    })
  }

  const removeFromLibrary = (id: number, quality: VideoQuality, type: "rent" | "buy") => {
    setItems((prev) => prev.filter((item) => !(item.id === id && item.quality === quality && item.type === type)))
  }

  const isInLibrary = (id: number) => {
    return items.some((item) => item.id === id)
  }

  const getLibraryItem = (id: number) => {
    return items.find((item) => item.id === id)
  }

  return (
    <LibraryContext.Provider value={{ items, addToLibrary, removeFromLibrary, isInLibrary, getLibraryItem }}>
      {children}
    </LibraryContext.Provider>
  )
}

export function useLibrary() {
  const context = useContext(LibraryContext)
  if (context === undefined) {
    throw new Error("useLibrary must be used within a LibraryProvider")
  }
  return context
}
