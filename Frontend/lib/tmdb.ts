const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

async function fetchFromTmdb(endpoint: string) {
  const res = await fetch(`${BASE_URL}${endpoint}&api_key=${API_KEY}`);
  if (!res.ok) throw new Error(`Failed to fetch: ${endpoint}`);
  const data = await res.json();
  return data;
}

// 🔥 Trending / Popular
export async function fetchPopularMovies() {
  const data = await fetchFromTmdb("/movie/popular?");
  return data.results;
}

// 🌟 Top Rated
export async function fetchTopRatedMovies() {
  const data = await fetchFromTmdb("/movie/top_rated?");
  return data.results;
}

// 🎬 Now Playing in Theatres
export async function fetchNowPlayingMovies() {
  const data = await fetchFromTmdb("/movie/now_playing?");
  return data.results;
}

// 🆕 New Releases (Past 30 days)
export async function fetchNewReleases() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const startDate = thirtyDaysAgo.toISOString().split("T")[0];
  const endDate = today.toISOString().split("T")[0];

  const query = `/discover/movie?primary_release_date.gte=${startDate}&primary_release_date.lte=${endDate}&sort_by=primary_release_date.desc&`;
  const data = await fetchFromTmdb(query);
  return data.results;
}

// 🔍 Search by Query
export async function searchMovies(query: string) {
  const data = await fetchFromTmdb(
    `/search/movie?query=${encodeURIComponent(query)}&`
  );
  return data.results;
}

// 📽 Get Movie Details (basic)
export async function fetchMovieDetails(movieId: string) {
  return await fetchFromTmdb(`/movie/${movieId}?`);
}

// New: Fetch full movie details including videos, credits
export async function fetchMovieDetailsById(movieId: number) {
  const data = await fetchFromTmdb(
    `/movie/${movieId}?append_to_response=credits,videos&`
  );
  return data;
}

// 🖼 Get Image URL
export function getPosterUrl(
  path: string | null,
  size: "w500" | "original" = "w500"
): string {
  return path
    ? `https://image.tmdb.org/t/p/${size}${path}`
    : "/placeholder.svg";
}

// Fetch movie videos separately if needed
export async function fetchMovieVideos(movieId: string) {
  const data = await fetchFromTmdb(`/movie/${movieId}/videos?`);
  return data.results;
}
