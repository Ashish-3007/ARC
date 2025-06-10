"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import {
  Play,
  Plus,
  Check,
  Star,
  ShoppingCart,
  Calendar,
  Lock,
} from "lucide-react";
import { useWatchlist } from "@/contexts/watchlist-context";
import { useLibrary } from "@/contexts/library-context";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PricingModal } from "./pricing-modal";
import { cn } from "@/lib/utils";
import { getPosterUrl } from "@/lib/tmdb";
import { mapGenreIdsToNames } from "@/lib/genres";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  genre_ids?: number[];
  genres?: string[];
}

interface MovieCardProps {
  movie: Movie;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
}

export function MovieCard({
  movie,
  size = "md",
  showDetails = true,
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { getLibraryItem } = useLibrary();
  const { addToast } = useToast();

  const libraryItem = getLibraryItem(movie.id);
  const hasAccess = !!libraryItem;
  const isExpired =
    libraryItem?.type === "rent" &&
    libraryItem.expiryDate &&
    new Date(libraryItem.expiryDate).getTime() < new Date().getTime();

  const genres =
    movie.genres ||
    (movie.genre_ids ? mapGenreIdsToNames(movie.genre_ids) : []);
  const releaseYear = new Date(movie.release_date).getFullYear();

  const sizeClasses = {
    sm: "w-[140px] sm:w-[160px] h-[210px] sm:h-[240px]",
    md: "w-[160px] sm:w-[180px] lg:w-[200px] h-[240px] sm:h-[270px] lg:h-[300px]",
    lg: "w-[180px] sm:w-[200px] lg:w-[240px] h-[270px] sm:h-[300px] lg:h-[360px]",
  };

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInWatchlist(movie.id)) {
      removeFromWatchlist(movie.id);
      addToast({
        title: "Removed from Watchlist",
        description: `${movie.title} has been removed.`,
        type: "default",
      });
    } else {
      addToWatchlist(movie);
      addToast({
        title: "Added to Watchlist",
        description: `${movie.title} has been added.`,
        type: "success",
      });
    }
  };

  const handlePricingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPricingModal(true);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!hasAccess || isExpired) {
      setShowPricingModal(true);
    }
  };

  return (
    <>
      <div
        className={cn(
          "relative rounded-xl overflow-hidden cursor-pointer group hover-card transition-all duration-300",
          sizeClasses[size]
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/movie/${movie.id}`}>
          <div className="relative w-full h-full">
            <img
              src={getPosterUrl(movie.poster_path)}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />

            {hasAccess && !isExpired && (
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                <Badge
                  variant={libraryItem.type === "buy" ? "success" : "default"}
                  className="bg-black/70 backdrop-blur-sm text-xs"
                >
                  {libraryItem.type === "buy" ? "Owned" : "Rented"}
                </Badge>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3">
              <h3 className="text-white font-semibold mb-1 line-clamp-2 text-sm sm:text-base lg:text-lg">
                {movie.title}
              </h3>

              <div className="flex items-center justify-between text-xs text-gray-300">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3 h-3" />
                  <span>{releaseYear}</span>
                </div>

                <Badge variant="default" className="bg-black/70 text-xs">
                  <Star className="w-3 h-3 mr-1 text-yellow-400" />
                  {movie.vote_average.toFixed(1)}
                </Badge>
              </div>
            </div>

            {showDetails && isHovered && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                <h3 className="text-white font-semibold mb-2 line-clamp-2 text-sm sm:text-base lg:text-lg">
                  {movie.title}
                </h3>

                <div className="flex items-center space-x-2 mb-2 text-xs text-gray-300">
                  <Calendar className="w-3 h-3" />
                  <span>{releaseYear}</span>
                  <Star className="w-3 h-3 ml-2 text-yellow-400" />
                  <span>{movie.vote_average.toFixed(1)}</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {genres.slice(0, 2).map((genre) => (
                    <Badge
                      key={genre}
                      variant="secondary"
                      className="text-xs bg-gray-700/80"
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {hasAccess && !isExpired ? (
                      <Link href={`/player/${movie.id}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-2 h-8 w-8 bg-white/20 rounded-full"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-2 h-8 w-8 bg-white/20 rounded-full"
                        onClick={handlePlayClick}
                      >
                        <Lock className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-2 h-8 w-8 bg-white/20 rounded-full"
                      onClick={handlePricingClick}
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={cn(
                      "p-2 h-8 w-8 rounded-full",
                      isInWatchlist(movie.id)
                        ? "bg-green-500/30 hover:bg-green-500/40 text-white"
                        : "bg-white/20 hover:bg-white/30"
                    )}
                    onClick={handleWatchlistToggle}
                  >
                    {isInWatchlist(movie.id) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Link>
      </div>

      <PricingModal
        movie={movie}
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
      />
    </>
  );
}
