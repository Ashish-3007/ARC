"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
import { MovieCard } from "@/components/movie-card";
import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useDebounce } from "@/hooks/use-debounce";
import { searchMovies, fetchMoviesByGenres } from "@/lib/mock-data";
import type { Movie } from "@/lib/mock-data";

const GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Crime",
  "Drama",
  "Horror",
  "Romance",
  "Sci-Fi",
  "Thriller",
];

const SORT_OPTIONS = [
  { label: "Relevance", value: "relevance" },
  { label: "Rating (High to Low)", value: "rating_desc" },
  { label: "Rating (Low to High)", value: "rating_asc" },
  { label: "Release Date (Newest)", value: "date_desc" },
  { label: "Release Date (Oldest)", value: "date_asc" },
  { label: "Title (A-Z)", value: "title_asc" },
  { label: "Title (Z-A)", value: "title_desc" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("relevance");
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const performSearch = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 200));

      let searchResults: Movie[] = [];

      if (debouncedQuery.trim()) {
        const tmdbResults = await searchMovies(debouncedQuery);
        searchResults = tmdbResults.map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "",
          backdrop_path: movie.backdrop_path
            ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
            : "",
          overview: movie.overview,
          release_date: movie.release_date,
          vote_average: movie.vote_average,
          genres: [], // Optionally resolve via detail fetch
          runtime: 0,
        }));
      } else if (selectedGenres.length > 0) {
        searchResults = await fetchMoviesByGenres(selectedGenres);
      }

      // Apply sorting
      searchResults = sortMovies(searchResults, sortBy);
      setResults(searchResults);
      setIsLoading(false);
    };

    performSearch();
  }, [debouncedQuery, selectedGenres, sortBy]);

  const sortMovies = (movies: Movie[], sortOption: string): Movie[] => {
    const sorted = [...movies];
    switch (sortOption) {
      case "rating_desc":
        return sorted.sort((a, b) => b.vote_average - a.vote_average);
      case "rating_asc":
        return sorted.sort((a, b) => a.vote_average - b.vote_average);
      case "date_desc":
        return sorted.sort(
          (a, b) =>
            new Date(b.release_date).getTime() -
            new Date(a.release_date).getTime()
        );
      case "date_asc":
        return sorted.sort(
          (a, b) =>
            new Date(a.release_date).getTime() -
            new Date(b.release_date).getTime()
        );
      case "title_asc":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "title_desc":
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return sorted;
    }
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSortBy("relevance");
  };

  const hasActiveFilters = selectedGenres.length > 0 || sortBy !== "relevance";

  return (
    <PageLayout
      title="Discover Movies"
      subtitle="Search and filter through our collection"
    >
      <div className="space-y-8">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for movies, genres, directors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-[#1a1a1a] border border-gray-800 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Toggle & Active Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <Badge
                variant="default"
                className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {selectedGenres.length + (sortBy !== "relevance" ? 1 : 0)}
              </Badge>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-gray-400 hover:text-white"
            >
              Clear Filters
            </Button>
          )}

          {/* Active Genre Badges */}
          {selectedGenres.map((genre) => (
            <Badge
              key={genre}
              variant="default"
              className="cursor-pointer hover:bg-purple-700 transition-colors"
              onClick={() => toggleGenre(genre)}
            >
              {genre}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-6 bg-[#1a1a1a] rounded-xl border border-gray-800 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Genres */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        selectedGenres.includes(genre)
                          ? "bg-purple-600 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Dropdown */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Sort By</h3>
                <DropdownMenu
                  trigger={
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label}
                      <Filter className="w-4 h-4" />
                    </Button>
                  }
                >
                  {SORT_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={
                        sortBy === option.value
                          ? "bg-purple-600 text-white"
                          : ""
                      }
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenu>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-400">
              {isLoading ? "Searching..." : `${results.length} movies found`}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-[#1a1a1a] rounded-xl h-[300px] mb-3"></div>
                  <div className="bg-[#1a1a1a] rounded h-4 mb-2"></div>
                  <div className="bg-[#1a1a1a] rounded h-3 w-2/3"></div>
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {results.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={{
                    ...movie,
                    poster_path: movie.poster_path ?? "",
                    backdrop_path: movie.backdrop_path ?? "",
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#1a1a1a] rounded-xl border border-gray-800">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-xl font-semibold mb-2">No movies found</h3>
              <p className="text-gray-400 mb-6">
                {query.trim()
                  ? `No results for "${query}". Try adjusting your search or filters.`
                  : "Try searching for a movie or selecting some genres."}
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters}>Clear Filters</Button>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
