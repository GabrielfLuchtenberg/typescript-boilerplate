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
});
