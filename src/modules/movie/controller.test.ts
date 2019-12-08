import { list, get } from "./controller";
import MockAdapter from "axios-mock-adapter";
import Redis from "ioredis-mock";
import firstPageMock from "./mock/page-1.json";
import secondPageMock from "./mock/page-2.json";
import { tdbmApi } from "../../infrastructure/apis/tdbm";
import { CacheLoader } from "./cache-loader";
import { ICacheLoader } from "../../infrastructure/cache/create-loader";

const reply = (config: any) => {
  if (config.params.page === "1") {
    return [200, { page: 1, results: firstPageMock }];
  }
  return [200, { page: 2, results: secondPageMock }];
};

let mock;
let cache: ICacheLoader<MovieDetails>;

const mockRedisMovie = {
  id: 330457,
  name: "Frozen II",
  poster: "/qdfARIhgpgZOBh3vfNhWS4hmSo3.jpg",
  overview:
    "Elsa, Anna, Kristoff and Olaf head far into the forest to learn the truth about an ancient mystery of their kingdom.",
  release_date: "2019-11-20"
};

describe("movie:controller", () => {
  beforeEach(() => {
    mock = new MockAdapter(tdbmApi);
    mock.onGet(/movie\/upcoming/).reply(reply);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
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
    beforeEach(() => {
      const redis = new Redis({
        data: { "movie:330457": JSON.stringify(mockRedisMovie) }
      });
      cache = CacheLoader(redis);
    });

    it("Should get from redis when the given resource exists", async () => {
      mock = new MockAdapter(tdbmApi);
      mock.onGet(/movie\/330457/).replyOnce(200, []);
      const spy = jest.spyOn(tdbmApi, "get");
      const response = await get({ id: 330457 }, cache);
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
      mock = new MockAdapter(tdbmApi);
      mock.onGet(/movie\/1/).replyOnce(200, movieMock);
      const movie = await get({ id: 1 });

      expect(movie.id).toEqual(1);
      expect(movie.name).toEqual("Movie 1");
      expect(movie.poster).toEqual("google.com");
      expect(movie.genres).toEqual([]);
      expect(movie.release_date).toEqual("12-09-1996");
      expect(movie.overview).toEqual("A great movie about the number one");
    });

    it("Should throw not found when there is no resource", async () => {
      mock = new MockAdapter(tdbmApi);
      mock.onGet(/movie\/[0-9+]/).replyOnce(404);
      expect(get({ id: 9 })).rejects.toThrow();
    });

    it("Should return the given movie", async () => {
      const movieMock = {
        id: 1,
        original_title: "Movie 1",
        poster_path: "google.com",
        genres: [],
        release_date: "12-09-1996",
        overview: "A great movie about the number one"
      };
      mock = new MockAdapter(tdbmApi);
      mock.onGet(/movie\/1/).replyOnce(200, movieMock);

      const movie = await get({ id: 1 });

      expect(movie.id).toEqual(1);
      expect(movie.name).toEqual("Movie 1");
      expect(movie.poster).toEqual("google.com");
      expect(movie.genres).toEqual([]);
      expect(movie.release_date).toEqual("12-09-1996");
      expect(movie.overview).toEqual("A great movie about the number one");
    });
  });
});
