import { list } from "./controller";
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
