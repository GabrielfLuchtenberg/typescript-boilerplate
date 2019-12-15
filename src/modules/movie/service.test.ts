import MockAdapter from "axios-mock-adapter";
import Redis from "ioredis-mock";
import firstPageMock from "./mock/page-1.json";
import secondPageMock from "./mock/page-2.json";
import { tdbmApi } from "../../infrastructure/apis/tdbm";
import { MovieCacheLoader, GenreCacheLoader } from "./loaders/cache-loader";
import {
  ICacheLoader,
  createCacheLoader
} from "../../infrastructure/cache/create-loader";
import { createService } from "./service";
import { IMovieDetails, IGenre } from "./types";

const reply = (config: any) => {
  if (config.params.page === "1") {
    return [200, { page: 1, results: firstPageMock }];
  }
  return [200, { page: 2, results: secondPageMock }];
};

let mock;
let movieCacheLoader: ICacheLoader<IMovieDetails>;
let genreCacheLoader: ICacheLoader<IGenre>;

const mockGenre1 = {
  id: 1,
  name: "firstGenre"
};
const mockGenre2 = {
  id: 2,
  name: "secondGenre"
};

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
  genres: [mockGenre1, mockGenre2],
  overview:
    "Elsa, Anna, Kristoff and Olaf head far into the forest to learn the truth about an ancient mystery of their kingdom.",
  release_date: "2019-11-20"
};
const defaultService = createService();
// const { get, list } = defaultService;

describe("movie:service", () => {
  describe("list", () => {
    const redis = new Redis({
      data: {
        "genre:1": JSON.stringify(mockGenre1),
        "genre:2": JSON.stringify(mockGenre2)
      }
    });
    beforeEach(() => {
      mock = new MockAdapter(tdbmApi);
      mock.onGet(/movie\/upcoming/).reply(reply);
      mock.onGet(/genre/).reply(200, { genres: [mockGenre1, mockGenre2] });
      movieCacheLoader = MovieCacheLoader(redis);
      genreCacheLoader = GenreCacheLoader(redis);
    });
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("Should return genres from api", async () => {
      mock = new MockAdapter(tdbmApi);
      mock.onGet(/genre/).reply(200, { genres: [mockGenre1, mockGenre2] });
      mock.onGet(/movie\/upcoming/).reply(200, {
        page: 1,
        results: [
          {
            poster_path: "/qdfARIhgpgZOBh3vfNhWS4hmSo3.jpg",
            id: 330457,
            original_title: "Frozen II",
            genre_ids: [1, 2],
            overview:
              "Elsa, Anna, Kristoff and Olaf head far into the forest to learn the truth about an ancient mystery of their kingdom.",
            release_date: "2019-11-20"
          }
        ]
      });
      const spy = jest.spyOn(tdbmApi, "get");
      const emptyRedis = new Redis();
      genreCacheLoader = GenreCacheLoader(emptyRedis);
      const { list } = createService(movieCacheLoader, genreCacheLoader);
      const data = await list();
      expect(data.results).toHaveLength(1);
      expect(data.results[0].genres).toEqual([mockGenre1, mockGenre2]);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it("Should return genres from cache", async () => {
      mock = new MockAdapter(tdbmApi);
      mock.onGet(/movie\/upcoming/).reply(200, {
        page: 1,
        results: [
          {
            poster_path: "/qdfARIhgpgZOBh3vfNhWS4hmSo3.jpg",
            id: 330457,
            original_title: "Frozen II",
            genre_ids: [1, 2],
            overview:
              "Elsa, Anna, Kristoff and Olaf head far into the forest to learn the truth about an ancient mystery of their kingdom.",
            release_date: "2019-11-20"
          }
        ]
      });
      const spy = jest.spyOn(tdbmApi, "get");
      const { list } = createService(movieCacheLoader, genreCacheLoader);
      const data = await list();
      expect(data.results).toHaveLength(1);
      expect(data.results[0].genres).toEqual([mockGenre1, mockGenre2]);
      expect(spy).toHaveBeenCalledTimes(1);
    });
    it("Should return only the Bombshell movies", async () => {
      const { list } = createService(movieCacheLoader, genreCacheLoader);
      const data = await list({ name: "bomb" });
      expect(data.results).toHaveLength(1);
      expect(data.results[0].name).toEqual("Bombshell");
    });
    it("Should use limit 20 as default", async () => {
      const { list } = createService(movieCacheLoader, genreCacheLoader);
      expect((await list()).results).toHaveLength(20);
    });
    it("Should use page 1 as default", async () => {
      const { list } = createService(movieCacheLoader, genreCacheLoader);
      expect((await list()).page).toEqual(1);
    });
    it("Should properly handle page 2", async () => {
      const { list } = createService(movieCacheLoader, genreCacheLoader);
      expect((await list({ page: 2 })).page).toEqual(2);
    });
    it("Should properly handle 25 as limit", async () => {
      const { list } = createService(movieCacheLoader, genreCacheLoader);
      expect((await list({ limit: 25 })).results).toHaveLength(25);
    });
  });

  describe("get", () => {
    const redis = new Redis({
      data: {
        "movie:330457": JSON.stringify(mockRedisMovie),
        "genre:1": mockGenre1,
        "genre:2": mockGenre2
      }
    });
    beforeEach(() => {
      movieCacheLoader = MovieCacheLoader(redis);
      genreCacheLoader = GenreCacheLoader(redis);
    });

    afterEach(() => {
      redis.del("movie:330457");
      jest.clearAllMocks();
    });

    it("Should get from redis when the given resource exists", async () => {
      const service = createService(movieCacheLoader, genreCacheLoader);
      mock = new MockAdapter(tdbmApi);
      mock.onGet(/movie\/330457/).replyOnce(200, []);
      const spy = jest.spyOn(tdbmApi, "get");
      const response = await service.get(330457);

      expect(response).toEqual(mockRedisMovie);
      expect(spy).not.toHaveBeenCalled();
    });

    it("Should get data from the api after not finding the resource on redis", async () => {
      const genreMock = [
        { id: "1", name: "genre1" },
        { id: "2", name: "genre2" }
      ];
      const movieMock = {
        id: 1,
        original_title: "Movie 1",
        poster_path: "google.com",
        genres: genreMock,
        release_date: "12-09-1996",
        overview: "A great movie about the number one"
      };
      const service = createService(movieCacheLoader, genreCacheLoader);
      mock = new MockAdapter(tdbmApi);
      mock.onGet(/movie\/1/).reply(200, movieMock);
      mock.onGet(/genre/).reply(200, genreMock);
      const movie = await service.get(1);

      expect(movie.id).toEqual(1);
      expect(movie.name).toEqual("Movie 1");
      expect(movie.posters[0]).toContain("google.com");
      expect(movie.genres).toEqual(genreMock);
      expect(movie.release_date).toEqual("12-09-1996");
      expect(movie.overview).toEqual("A great movie about the number one");
    });

    it("Should throw not found when there is no resource", async () => {
      const { get } = createService(movieCacheLoader, genreCacheLoader);
      mock = new MockAdapter(tdbmApi);
      mock.onGet(/movie\/[0-9+]/).replyOnce(404);
      expect(get(9)).rejects.toThrow();
    });
  });
});
