"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useSidebar } from "@/contexts/sidebar-context";
import { MovieCarousel } from "@/components/movie-carousel";
import { HeroSection } from "@/components/hero-section";
import { AuthModal } from "@/components/auth-modal";
import { cn } from "@/lib/utils";
import {
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchNowPlayingMovies,
  fetchNewReleases,
} from "@/lib/tmdb";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const { isOpen } = useSidebar();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [popular, setPopular] = useState<any[]>([]);
  const [topRated, setTopRated] = useState<any[]>([]);
  const [nowPlaying, setNowPlaying] = useState<any[]>([]);
  const [newReleases, setNewReleases] = useState<any[]>([]);
  const [heroMovie, setHeroMovie] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      setShowAuthModal(true);
    }
  }, [user, isLoading]);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const [popularData, topRatedData, nowPlayingData, newReleasesData] =
          await Promise.all([
            fetchPopularMovies(),
            fetchTopRatedMovies(),
            fetchNowPlayingMovies(),
            fetchNewReleases(),
          ]);

        setPopular(popularData);
        setTopRated(topRatedData);
        setNowPlaying(nowPlayingData);
        setNewReleases(newReleasesData);

        const hour = new Date().getHours();

        if (hour >= 6 && hour < 12) {
          setHeroMovie(popularData[0]); // Morning: show trending
        } else if (hour >= 12 && hour < 18) {
          setHeroMovie(topRatedData[0]); // Afternoon: top rated
        } else if (hour >= 18 && hour < 24) {
          setHeroMovie(nowPlayingData[0]); // Evening: now playing
        } else {
          setHeroMovie(newReleasesData[0]); // Late night: new releases
        }
      } catch (error) {
        console.error("Failed to load movies", error);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121212]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-400">Loading ARC...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <div
        className={cn(
          "transition-all duration-300",
          "ml-0",
          isOpen ? "lg:ml-72" : "lg:ml-20"
        )}
      >
        {heroMovie && <HeroSection movie={heroMovie} />}

        <div className="px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 space-y-6 sm:space-y-8 lg:space-y-12">
          <MovieCarousel title="Trending Now" movies={popular} />
          <MovieCarousel title="Top Picks" movies={topRated} />
          <MovieCarousel title="Now Playing" movies={nowPlaying} />
          <MovieCarousel title="New Releases" movies={newReleases} />
        </div>
      </div>
    </div>
  );
}
