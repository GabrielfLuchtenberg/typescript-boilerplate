import { upcoming, get as getMovie, IUpcomingFilters } from "./api-loader";
import { CacheLoader } from "./cache-loader";
import { redis } from "../../infrastructure/cache/redis";
import { ICacheLoader } from "../../infrastructure/cache/create-loader";
import { filterMovies } from "./parsers";

const cacheLoader = CacheLoader(redis);
interface ListArgs {
  name?: string;
  limit?: number;
  page?: number;
}
interface GetArgs {
  id: number;
}

export const list = async ({
  name,
  page = 1,
  limit = 20
}: ListArgs = {}): Promise<Page<Movie>> => {
  const movies = await upcoming(limit, page);
  console.log(name);
  if (name) {
    return { page, results: filterMovies(movies, name) };
  }
  return {
    page,
    results: movies
  };
};

export const get = async (
  { id }: GetArgs,
  cache: ICacheLoader<MovieDetails> = cacheLoader
): Promise<MovieDetails> => {
  const cachedMovie = await cache.get(id);

  if (cachedMovie) {
    return cachedMovie;
  }

  const movie = await getMovie(id);
  cache.set(id, movie);

  return movie;
};
