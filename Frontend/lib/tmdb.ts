const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
const BASE_URL = "https://api.themoviedb.org/3";

// Build full TMDB API URL with key
function buildEndpoint(endpoint: string) {
  const connector = endpoint.includes("?") ? "&" : "?";
  return `${BASE_URL}${endpoint}${connector}api_key=${API_KEY}&language=en-US`;
}

// Generic fetch helper
async function fetchFromTmdb<T = any>(endpoint: string): Promise<T> {
  const res = await fetch(buildEndpoint(endpoint), {
    next: { revalidate: 3600 }, // optional caching: 1 hour
  });
  if (!res.ok) throw new Error(`TMDB fetch failed: ${endpoint}`);
  return res.json();
}

// 🔥 Popular Movies
export async function fetchPopularMovies() {
  const data = await fetchFromTmdb("/movie/popular");
  return data.results;
}

// 🌟 Top Rated
export async function fetchTopRatedMovies() {
  const data = await fetchFromTmdb("/movie/top_rated");
  return data.results;
}

// 🎬 Now Playing
export async function fetchNowPlayingMovies() {
  const data = await fetchFromTmdb("/movie/now_playing");
  return data.results;
}

// 🆕 New Releases
export async function fetchNewReleases() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const startDate = thirtyDaysAgo.toISOString().split("T")[0];
  const endDate = today.toISOString().split("T")[0];

  const query = `/discover/movie?primary_release_date.gte=${startDate}&primary_release_date.lte=${endDate}&sort_by=primary_release_date.desc`;
  const data = await fetchFromTmdb(query);
  return data.results;
}

// 🔍 Search
export async function searchMovies(query: string) {
  const data = await fetchFromTmdb(
    `/search/movie?query=${encodeURIComponent(query)}&include_adult=false`
  );
  return data.results;
}

// 🎭 Genre List
export async function fetchGenres(): Promise<{ id: number; name: string }[]> {
  const data = await fetchFromTmdb("/genre/movie/list");
  return data.genres;
}

// 🔍 Discover by Genre
export async function fetchMoviesByGenres(genres: string[]) {
  const genreMap = await fetchGenres();
  const genreIds = genres
    .map(
      (g) =>
        genreMap.find((gm) => gm.name.toLowerCase() === g.toLowerCase())?.id
    )
    .filter(Boolean)
    .join(",");

  const data = await fetchFromTmdb(
    `/discover/movie?with_genres=${genreIds}&sort_by=popularity.desc`
  );
  return data.results;
}

// 🎞 Full Movie Details + credits & videos
export async function fetchMovieDetailsById(movieId: number | string) {
  return await fetchFromTmdb(
    `/movie/${movieId}?append_to_response=credits,videos`
  );
}

// 🎥 Videos Only
export async function fetchMovieVideos(movieId: number | string) {
  const data = await fetchFromTmdb(`/movie/${movieId}/videos`);
  return data.results;
}

// 🖼 Poster URL
export function getPosterUrl(
  path: string | null,
  size: "w500" | "original" = "w500"
): string {
  return path
    ? `https://image.tmdb.org/t/p/${size}${path}`
    : "/placeholder.svg";
}

// 🖼 Backdrop URL
export function getBackdropUrl(
  path: string | null | undefined,
  size: "w300" | "w780" | "w1280" | "original" = "w1280"
): string {
  if (!path) return "/placeholder.csv"; // local placeholder if needed
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// 🏆 Top Trending Movie of the Day
export async function getTopTrendingMovie() {
  const trending = await fetchFromTmdb<{ results: any[] }>(
    "/trending/movie/day"
  );
  const top = trending.results?.[0];
  if (!top) return null;

  const [details, credits] = await Promise.all([
    fetchMovieDetailsById(top.id),
    fetchFromTmdb(`/movie/${top.id}/credits`),
  ]);

  return {
    id: details.id,
    title: details.title,
    poster_path: getPosterUrl(details.poster_path),
    backdrop_path: getBackdropUrl(details.backdrop_path),
    overview: details.overview,
    release_date: details.release_date,
    vote_average: details.vote_average,
    runtime: details.runtime,
    genres: details.genres?.map((g: { name: string }) => g.name) || [],
    credits,
  };
}
