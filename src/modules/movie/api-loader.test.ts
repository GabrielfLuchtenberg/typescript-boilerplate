import MockAdapter from "axios-mock-adapter";
import { tdbmApi } from "../../infrastructure/apis/tdbm";
import firstPageMock from "./mock/page-1.json";
import secondPageMock from "./mock/page-2.json";
import { upcoming } from "./api-loader";

const reply = (config: any) => {
  if (config.params.page === "1") {
    return [200, { page: 1, results: firstPageMock }];
  }
  return [200, { page: 2, results: secondPageMock }];
};

let mock;
describe("movie:api-loader", () => {
  beforeEach(() => {
    mock = new MockAdapter(tdbmApi);
    mock.onGet(/movie\/upcoming/).replyOnce(reply);
    mock.onGet(/movie\/upcoming/).replyOnce(reply);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("upcoming", () => {
    it("When there is 40 results and limit is 12 results, should return 12 results", async () => {
      const data = await upcoming(12);
      expect(data).toHaveLength(12);
    });

    it("When we don't pass a limit it should be 20 results", async () => {
      const data = await upcoming();
      expect(data).toHaveLength(20);
    });

    it("When there is 40 results and limit is 25 results, should return 25 results", async () => {
      const data = await upcoming(25);
      expect(data).toHaveLength(25);
    });

    it("When there is 20 results and limit is 35 results, should return 30 results", async () => {
      mock = new MockAdapter(tdbmApi);

      mock
        .onGet(/movie\/upcoming/)
        .replyOnce(200, { page: 1, results: firstPageMock });

      mock.onGet(/movie\/upcoming/).replyOnce(200, { page: 3, results: [] });

      const data = await upcoming(35);
      expect(data).toHaveLength(20);
    });
    it("Should pass through the requested page to the third part api", async () => {
      const spy = jest.spyOn(tdbmApi, "get");
      await upcoming(20, 3);
      expect(spy).toHaveBeenCalledTimes(1);

      const expectedQueryParams = { params: { page: 3 } };
      expect(spy).toHaveBeenCalledWith("movie/upcoming", expectedQueryParams);
    });
  });
});
