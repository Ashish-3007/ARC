"use client"

import { useWatchlist } from "@/contexts/watchlist-context"
import { MovieCard } from "@/components/movie-card"
import Link from "next/link"
import { PageLayout } from "@/components/page-layout"

export default function WatchlistPage() {
  const { watchlist } = useWatchlist()

  return (
    <PageLayout title="My Watchlist">
      <div className="max-w-6xl mx-auto">
        {watchlist.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400 mb-6">Your watchlist is empty</p>
            <Link
              href="/"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Discover Movies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {watchlist.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
