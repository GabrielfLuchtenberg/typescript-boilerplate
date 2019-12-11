import { Redis } from "ioredis";
import { createCacheLoader } from "../../../infrastructure/cache/create-loader";

export const CacheLoader = (cache: Redis) => {
  return createCacheLoader<IMovieDetails>(
    cache,
    id => `movie:${id}`,
    JSON.stringify,
    JSON.parse
  );
};
