import { hello } from "../controller";
describe("hello", () => {
  it("Should return hello with an name", async () => {
    expect(await hello({ name: "Gabriel" })).toEqual("Hello Gabriel");
  });
});
