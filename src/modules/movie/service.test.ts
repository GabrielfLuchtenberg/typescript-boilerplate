import { createService } from "./service";
import MockAdapter from "axios-mock-adapter";
import Redis from "ioredis-mock";
import firstPageMock from "./mock/page-1.json";
import secondPageMock from "./mock/page-2.json";
import { tdbmApi } from "../../infrastructure/apis/tdbm";
import { CacheLoader } from "./loaders/cache-loader";
import { ICacheLoader } from "../../infrastructure/cache/create-loader";

const reply = (config: any) => {
  if (config.params.page === "1") {
    return [200, { page: 1, results: firstPageMock }];
  }
  return [200, { page: 2, results: secondPageMock }];
};

let mock;
let cache: ICacheLoader<IMovieDetails>;

const mockRedisMovie = {
  id: 330457,
  name: "Frozen II",
  posters: [
    "https://image.tmdb.org/t/p/w92//db32LaOibwEliAmSL2jjDF6oDdj.jpg",
    "https://image.tmdb.org/t/p/w154//db32LaOibwEliAmSL2jjDF6oDdj.jpg",
    "https://image.tmdb.org/t/p/w185//db32LaOibwEliAmSL2jjDF6oDdj.jpg",
    "https://image.tmdb.org/t/p/w342//db32LaOibwEliAmSL2jjDF6oDdj.jpg",
    "https://image.tmdb.org/t/p/w500//db32LaOibwEliAmSL2jjDF6oDdj.jpg",
    "https://image.tmdb.org/t/p/w780//db32LaOibwEliAmSL2jjDF6oDdj.jpg",
    "https://image.tmdb.org/t/p/original//db32LaOibwEliAmSL2jjDF6oDdj.jpg"
  ],
  overview:
    "Elsa, Anna, Kristoff and Olaf head far into the forest to learn the truth about an ancient mystery of their kingdom.",
  release_date: "2019-11-20"
};

const defaultService = createService();
const { get, list } = defaultService;

describe("movie:service", () => {
  describe("list", () => {
    beforeEach(() => {
      mock = new MockAdapter(tdbmApi);
      mock.onGet(/movie\/upcoming/).reply(reply);
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    it("Should return only the Bombshell movies", async () => {
      const data = await list({ name: "bomb" });
      expect(data.results).toHaveLength(1);
      expect(data.results[0].name).toEqual("Bombshell");
    });
    it("Should use limit 20 as default", async () => {
      expect((await list()).results).toHaveLength(20);
    });
    it("Should use page 1 as default", async () => {
      expect((await list()).page).toEqual(1);
    });
    it("Should properly handle page 2", async () => {
      expect((await list({ page: 2 })).page).toEqual(2);
    });
    it("Should properly handle 25 as limit", async () => {
      expect((await list({ limit: 25 })).results).toHaveLength(25);
    });
  });

  describe("get", () => {
    const redis = new Redis({
      data: { "movie:330457": JSON.stringify(mockRedisMovie) }
    });
    beforeEach(() => {
      cache = CacheLoader(redis);
    });

    afterEach(() => {
      redis.del("movie:330457");
      jest.clearAllMocks();
    });

    it("Should get from redis when the given resource exists", async () => {
      const service = createService(cache);
      mock = new MockAdapter(tdbmApi);
      mock.onGet(/movie\/330457/).replyOnce(200, []);
      const spy = jest.spyOn(tdbmApi, "get");
      const response = await service.get(330457);

      expect(response).toEqual(mockRedisMovie);
      expect(spy).not.toHaveBeenCalled();
    });

    it("Should get data from the api after not finding the resource on redis", async () => {
      const movieMock = {
        id: 1,
        original_title: "Movie 1",
        poster_path: "google.com",
        genres: [],
        release_date: "12-09-1996",
        overview: "A great movie about the number one"
      };
      const service = createService(cache);
      mock = new MockAdapter(tdbmApi);
      mock.onGet(/movie\/1/).reply(200, movieMock);
      const movie = await service.get(1);

      expect(movie.id).toEqual(1);
      expect(movie.name).toEqual("Movie 1");
      expect(movie.posters[0]).toContain("google.com");
      expect(movie.genres).toEqual([]);
      expect(movie.release_date).toEqual("12-09-1996");
      expect(movie.overview).toEqual("A great movie about the number one");
    });

    it("Should throw not found when there is no resource", async () => {
      mock = new MockAdapter(tdbmApi);
      mock.onGet(/movie\/[0-9+]/).replyOnce(404);
      expect(get(9)).rejects.toThrow();
    });
  });
});
