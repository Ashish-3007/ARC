"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { VideoQuality, RentalDuration } from "@/lib/pricing"

export interface CartItem {
  id: number
  title: string
  poster_path: string
  type: "rent" | "buy"
  price: number
  quality: VideoQuality
  duration: RentalDuration
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: number, quality: VideoQuality, duration: RentalDuration) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addToCart = (item: CartItem) => {
    setItems((prev) => {
      const existingItem = prev.find(
        (i) => i.id === item.id && i.quality === item.quality && i.duration === item.duration,
      )
      if (existingItem) return prev
      return [...prev, item]
    })
  }

  const removeFromCart = (id: number, quality: VideoQuality, duration: RentalDuration) => {
    setItems((prev) =>
      prev.filter((item) => !(item.id === id && item.quality === quality && item.duration === duration)),
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const total = items.reduce((sum, item) => sum + item.price, 0)
  const itemCount = items.length

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
