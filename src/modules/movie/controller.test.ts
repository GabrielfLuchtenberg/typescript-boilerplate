import { list, get } from "./controller";
import MockAdapter from "axios-mock-adapter";
import firstPageMock from "./mock/page-1.json";
import secondPageMock from "./mock/page-2.json";
import { tdbmApi } from "../../infrastructure/apis/tdbm";

const reply = (config: any) => {
  if (config.params.page === "1") {
    return [200, { page: 1, results: firstPageMock }];
  }
  return [200, { page: 2, results: secondPageMock }];
};

let mock;
describe("movie:controller", () => {
  beforeEach(() => {
    mock = new MockAdapter(tdbmApi);
    mock.onGet(/movie\/upcoming/).reply(reply);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("list", () => {
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
