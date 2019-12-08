import { upcoming, get as getMovie } from "./api-loader";
import { CacheLoader } from "./cache-loader";
import { redis } from "../../infrastructure/cache/redis";
import { ICacheLoader } from "../../infrastructure/cache/create-loader";

const cacheLoader = CacheLoader(redis);
interface ListArgs {
  limit?: number;
  page?: number;
}
interface GetArgs {
  id: number;
}

export const list = async ({ page = 1, limit = 20 }: ListArgs = {}) => {
  const movies = await upcoming(limit, page);
  const moviesPage: Page<Movie> = {
    page,
    results: movies
  };
  return moviesPage;
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
