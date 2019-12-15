import { Redis } from "ioredis";

export interface ICacheLoader<T> {
  get: (id: number | string) => Promise<T | undefined>;
  list: (ids: Array<number | string>) => Promise<T[] | []>;
  set: (id: number | string, item: T) => void;
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
    return deserialize(json) as T;
  };

  const list = async (ids: Array<number | string>): Promise<T[] | []> => {
    const promises = ids.map(async (id: number | string) => get(id));
    const items = await Promise.all(promises);
    const filteredItems = items.filter(item => Boolean(item));

    if (!filteredItems) {
      return [];
    }

    return filteredItems as T[];
  };

  const set = (id: number | string, value: T) => {
    const stringified = serialize(value);
    cache.set(createKey(id), stringified, "ex", expirationTime);
  };

  return { get, set, list };
};
