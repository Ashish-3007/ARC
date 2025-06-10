"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Play,
  Plus,
  Check,
  Star,
  ShoppingCart,
  Calendar,
  Clock,
} from "lucide-react";
import { useWatchlist } from "@/contexts/watchlist-context";
import Link from "next/link";
import { PageLayout } from "@/components/page-layout";
import { PricingModal } from "@/components/pricing-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  runtime: number;
  genres: string[];
  director: string;
  cast: string[];
}

export default function MoviePage() {
  const params = useParams();
  const movieId = Number(params.id);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  useEffect(() => {
    async function fetchMovieDetails() {
      try {
        const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
        const movieRes = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US`
        );
        const creditsRes = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}&language=en-US`
        );
        const movieData = await movieRes.json();
        const creditsData = await creditsRes.json();

        const director =
          creditsData.crew.find((member: any) => member.job === "Director")
            ?.name || "Unknown";
        const cast = creditsData.cast
          .slice(0, 8)
          .map((actor: any) => actor.name);

        const formattedMovie: Movie = {
          id: movieData.id,
          title: movieData.title,
          poster_path: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
          backdrop_path: `https://image.tmdb.org/t/p/original${movieData.backdrop_path}`,
          overview: movieData.overview,
          release_date: movieData.release_date,
          vote_average: movieData.vote_average,
          runtime: movieData.runtime,
          genres: movieData.genres.map((g: any) => g.name),
          director,
          cast,
        };

        setMovie(formattedMovie);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    }

    if (movieId) {
      fetchMovieDetails();
    }
  }, [movieId]);

  if (!movie) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <p>Movie not found or loading...</p>
      </div>
    );
  }

  const handleWatchlistToggle = () => {
    if (isInWatchlist(movie.id)) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-900">
        {/* Hero Section */}
        <div className="relative h-[60vh] lg:h-[70vh] overflow-hidden -mt-20 pt-20">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${movie.backdrop_path})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/70 to-transparent" />
          </div>

          <div className="relative z-10 flex items-end h-full px-4 lg:px-8 pb-8">
            <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-8 max-w-6xl w-full">
              <img
                src={movie.poster_path}
                alt={movie.title}
                className="w-48 lg:w-64 h-72 lg:h-96 object-cover rounded-lg shadow-2xl mx-auto lg:mx-0"
              />

              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-3xl lg:text-5xl font-bold mb-4">
                  {movie.title}
                </h1>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-semibold">
                      {movie.vote_average.toFixed(1)}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="flex items-center space-x-1"
                  >
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                  </Badge>
                  <Badge
                    variant="outline"
                    className="flex items-center space-x-1"
                  >
                    <Clock className="w-3 h-3" />
                    <span>{movie.runtime} min</span>
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 mb-6 justify-center lg:justify-start">
                  {movie.genres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>

                <p className="text-base lg:text-lg text-gray-300 mb-6 max-w-2xl mx-auto lg:mx-0">
                  {movie.overview}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <Link href={`/player/${movie.id}`}>
                    <Button size="lg" className="w-full sm:w-auto">
                      <Play className="w-5 h-5 mr-2" />
                      Play
                    </Button>
                  </Link>

                  <Button
                    size="lg"
                    onClick={() => setShowPricingModal(true)}
                    className="w-full sm:w-auto"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Rent or Buy
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleWatchlistToggle}
                    className="w-full sm:w-auto"
                  >
                    {isInWatchlist(movie.id) ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        In Watchlist
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Add to Watchlist
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Movie Details */}
        <div className="px-4 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Cast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {movie.cast.map((actor) => (
                      <p key={actor} className="text-gray-300">
                        {actor}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="font-semibold text-gray-400">
                        Director:
                      </span>
                      <span className="ml-2">{movie.director}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-400">
                        Release Date:
                      </span>
                      <span className="ml-2">
                        {new Date(movie.release_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-400">
                        Runtime:
                      </span>
                      <span className="ml-2">{movie.runtime} minutes</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-400">
                        Rating:
                      </span>
                      <span className="ml-2">
                        {movie.vote_average.toFixed(1)}/10
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <PricingModal
        movie={movie}
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
      />
    </PageLayout>
  );
}
