import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { AuthProvider } from "@/contexts/auth-context"
import { CartProvider } from "@/contexts/cart-context"
import { WatchlistProvider } from "@/contexts/watchlist-context"
import { LibraryProvider } from "@/contexts/library-context"
import { SidebarProvider } from "@/contexts/sidebar-context"
import { ToastProvider } from "@/components/ui/toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ARC - Movie Rental & Purchase Platform",
  description: "Discover, rent, and purchase your favorite movies with the ultimate viewing experience",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <WatchlistProvider>
              <LibraryProvider>
                <SidebarProvider>
                  <ToastProvider>
                    <div className="flex min-h-screen bg-gray-900">
                      <Sidebar />
                      <main className="flex-1 transition-all duration-300">{children}</main>
                    </div>
                  </ToastProvider>
                </SidebarProvider>
              </LibraryProvider>
            </WatchlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
