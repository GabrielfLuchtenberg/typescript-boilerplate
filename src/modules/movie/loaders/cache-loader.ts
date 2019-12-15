import { Redis } from "ioredis";
import { createCacheLoader } from "../../../infrastructure/cache/create-loader";
import { IMovieDetails, IGenre } from "../types";

export const MovieCacheLoader = (cache: Redis) => {
  return createCacheLoader<IMovieDetails>(
    cache,
    id => `movie:${id}`,
    JSON.stringify,
    JSON.parse
  );
};

export const GenreCacheLoader = (cache: Redis) => {
  return createCacheLoader<IGenre>(
    cache,
    id => `genre:${id}`,
    JSON.stringify,
    JSON.parse
  );
};
