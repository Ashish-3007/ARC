"use client"

import { cn } from "@/lib/utils"

import { Play, Plus, Info, Check } from "lucide-react"
import { useWatchlist } from "@/contexts/watchlist-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { Movie } from "@/lib/mock-data"

interface HeroSectionProps {
  movie: Movie
}

export function HeroSection({ movie }: HeroSectionProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
  const inWatchlist = isInWatchlist(movie.id)

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      removeFromWatchlist(movie.id)
    } else {
      addToWatchlist(movie)
    }
  }

  const releaseYear = new Date(movie.release_date).getFullYear()

  return (
    <div className="relative h-[50vh] sm:h-[60vh] lg:h-[75vh] xl:h-[85vh] overflow-hidden">
      {/* Background Image with Gradient */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${movie.backdrop_path})` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center h-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl lg:max-w-2xl animate-slide-up">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
            {movie.genres?.slice(0, 3).map((genre) => (
              <Badge
                key={genre}
                variant="secondary"
                className="bg-black/40 backdrop-blur-sm border border-white/10 text-xs sm:text-sm"
              >
                {genre}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-3 leading-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            {movie.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-300">
            <div className="flex items-center">
              <Badge variant="default" className="mr-2 bg-purple-600/80 backdrop-blur-sm text-xs">
                {movie.vote_average.toFixed(1)}
              </Badge>
              <span className="hidden sm:inline">Rating</span>
            </div>
            <div>{releaseYear}</div>
            <div>{movie.runtime} min</div>
          </div>

          {/* Overview */}
          <p className="text-sm sm:text-base lg:text-lg text-gray-300 mb-4 sm:mb-6 lg:mb-8 line-clamp-2 sm:line-clamp-3 max-w-lg lg:max-w-xl leading-relaxed">
            {movie.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 lg:gap-4">
            <Link href={`/player/${movie.id}`}>
              <Button size="lg" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white shadow-lg">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Play
              </Button>
            </Link>

            <Link href={`/movie/${movie.id}`}>
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto bg-gray-800/50 backdrop-blur-sm border border-gray-700/50"
              >
                <Info className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                More Info
              </Button>
            </Link>

            <Button
              size="lg"
              variant="outline"
              onClick={handleWatchlistToggle}
              className={cn(
                "w-full sm:w-auto border-gray-600/50 backdrop-blur-sm",
                inWatchlist ? "bg-green-600/20 border-green-600/50 text-green-400" : "hover:bg-gray-800/30",
              )}
            >
              {inWatchlist ? (
                <>
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="hidden sm:inline">In Watchlist</span>
                  <span className="sm:hidden">Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="hidden sm:inline">Add to Watchlist</span>
                  <span className="sm:hidden">Add</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
