import { Redis } from "ioredis";

export interface ICacheLoader<T> {
  get: (id: number | string) => Promise<T | undefined>;
  set: (id: number | string, movie: T) => void;
}

export const createCacheLoader = <T>(
  redis: Redis,
  createKey: (value: number | string) => string,
  serialize: (value: T) => string,
  deserialize: (value: string) => T
): ICacheLoader<T> => {
  const cache = redis;
  const expirationTime = 60 * 60 * 24;

  const get = async (id: number | string): Promise<T | undefined> => {
    const json = await cache.get(createKey(id));
    if (!json) {
      return;
    }

    const object = deserialize(json) as T;
    return object;
  };

  const set = (id: number | string, value: T) => {
    const stringifiedMovie = serialize(value);
    cache.set(createKey(id), stringifiedMovie, "ex", expirationTime);
  };

  return { get, set };
};
