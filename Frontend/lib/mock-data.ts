// lib/movie-data.ts
import {
  fetchMovieDetailsById,
  fetchNewReleases,
  fetchNowPlayingMovies,
  fetchPopularMovies,
  fetchTopRatedMovies,
} from "./tmdb";

// Type mapping based on TMDB response:
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
    crew: { job: string; name: string }[];
  };
  videos: { results: { key: string; site: string; type: string }[] };
}

export async function getMovieById(id: number): Promise<Movie | null> {
  try {
    const data = await fetchMovieDetailsById(id);
    return data as Movie;
  } catch {
    return null;
  }
}

export {
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchNowPlayingMovies,
  fetchNewReleases,
};
