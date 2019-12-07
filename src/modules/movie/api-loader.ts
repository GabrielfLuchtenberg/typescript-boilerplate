import { tdbmApi } from "../../infrastructure/apis/tdbm";
import {
  parseMovieList,
  parseMovie,
  fetchTimes,
  mergeMoviesPagesIntoMovies
} from "./parsers";

const defaultNumberOfResponses = 20;

const getNumberOfRequests = (limit: number) =>
  Math.ceil(limit / defaultNumberOfResponses);

const fetchPage = async (page: number) =>
  tdbmApi.get<Page<TMDBMovie>>("movie/upcoming", {
    params: { page }
  });

const fetchListFromApi = async ({
  page,
  limit
}: {
  page: number;
  limit: number;
}): Promise<TMDBMovie[]> => {
  const numberOfRequests = getNumberOfRequests(limit);
  const pages = await fetchTimes(numberOfRequests, page, fetchPage);
  const movies = mergeMoviesPagesIntoMovies(pages);
  return movies;
};

const limitMovies = (movies: TMDBMovie[], limit: number) =>
  movies.splice(0, limit);

export const upcoming = async (
  limit: number = 20,
  page: number = 1
): Promise<Movie[]> => {
  const apiMovies = await fetchListFromApi({ page, limit });
  const movies = parseMovieList(limitMovies(apiMovies, limit));

  return movies;
};

export const get = async (id: number): Promise<MovieDetails> => {
  const apiMovie = await tdbmApi.get<TMDBMovie>(`movie/${id}`);
  const movie = parseMovie(apiMovie.data);
  return movie;
};
