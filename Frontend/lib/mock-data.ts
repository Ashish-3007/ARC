import {
  fetchMovieDetailsById,
  fetchNewReleases,
  fetchNowPlayingMovies,
  fetchPopularMovies,
  fetchTopRatedMovies,
  searchMovies,
  fetchMoviesByGenres,
} from "./tmdb";

// TMDB Movie Type
export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  runtime: number;
  genres: { id: number; name: string }[];
  credits: {
    cast: {
      cast_id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
    crew: {
      job: string;
      name: string;
    }[];
  };
  videos: {
    results: {
      key: string;
      site: string;
      type: string;
    }[];
  };
}

// Get movie by ID
export async function getMovieById(id: number): Promise<Movie | null> {
  try {
    const data = await fetchMovieDetailsById(id);
    return data as Movie;
  } catch (error) {
    console.error("Failed to fetch movie by ID:", error);
    return null;
  }
}

// Optional: Get trailer key
export function getYouTubeTrailerKey(movie: Movie): string | null {
  const trailers = movie.videos?.results?.filter(
    (vid) => vid.site === "YouTube" && vid.type === "Trailer"
  );
  return trailers?.[0]?.key ?? null;
}

// Export fetch functions
export {
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchNowPlayingMovies,
  fetchNewReleases,
  searchMovies,
  fetchMoviesByGenres,
};
