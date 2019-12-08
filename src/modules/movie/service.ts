import { CacheLoader } from "./loaders/cache-loader";
import { redis } from "../../infrastructure/cache/redis";
import { ICacheLoader } from "../../infrastructure/cache/create-loader";
import { filterMovies } from "./parsers";
import { upcoming, get as getMovie } from "./loaders/api-loader";

const cacheLoader = CacheLoader(redis);

interface ListArgs {
  name?: string;
  limit?: number;
  page?: number;
}
const createService = (cache: ICacheLoader<MovieDetails> = cacheLoader) => {
  const list = async ({ name, page = 1, limit = 20 }: ListArgs = {}) => {
    const movies = await upcoming(limit, page);

    if (name) {
      return { page, results: filterMovies(movies, name) };
    }
    return {
      page,
      results: movies
    };
  };

  const get = async (id: number): Promise<MovieDetails> => {
    const cachedMovie = await cache.get(id);
    if (cachedMovie) {
      return cachedMovie;
    }

    const movie = await getMovie(id);
    cache.set(id, movie);
    return movie;
  };
  return { get, list };
};
export { createService };
