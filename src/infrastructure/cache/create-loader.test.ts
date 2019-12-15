import Redis from "ioredis-mock";
import { createCacheLoader } from "./create-loader";

describe("createCacheLoader", () => {
  it("Should set values on cache", () => {
    const redis = new Redis();
    const loader = createCacheLoader<string>(
      redis,
      value => `${value}`,
      value => value,
      value => value
    );
    loader.set("hi", "there");
    expect(redis.data.get("hi")).toEqual("there");
  });

  it("Should get values from cache", async () => {
    const redis = new Redis({
      data: {
        key: "value"
      }
    });
    const loader = createCacheLoader<string>(
      redis,
      value => `${value}`,
      value => value,
      value => value
    );
    const response = await loader.get("key");
    expect(response).toEqual("value");
  });

  it("Should return undefined when there is no matching value on cache", async () => {
    const redis = new Redis({
      data: {
        key2: "value"
      }
    });
    const loader = createCacheLoader<string>(
      redis,
      value => `${value}`,
      value => value,
      value => value
    );
    const response = await loader.get("key");
    expect(response).toBeUndefined();
  });

  it("Should return a list of items from cache", async () => {
    const redis = new Redis({
      data: {
        key1: "val1",
        key2: "val2"
      }
    });
    const loader = createCacheLoader<string>(
      redis,
      value => `${value}`,
      value => value,
      value => value
    );
    const response = await loader.list(["key1", "key2"]);
    expect(response).toEqual(["val1", "val2"]);
  });

  it("Should return empty array  from cache", async () => {
    const redis = new Redis({
      data: {
        key1: "val1",
        key2: "val2"
      }
    });
    const loader = createCacheLoader<string>(
      redis,
      value => `${value}`,
      value => value,
      value => value
    );
    const response = await loader.list(["key4", "key5"]);
    expect(response).toEqual([]);
  });
});
