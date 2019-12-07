import { Request, Response } from "express";
import { hello } from "./controller";

export default [
  {
    path: "/v1/hello",
    method: "get",
    handler: async ({ body }: Request, res: Response) => {
      const result = await hello(body);
      res.status(200).send(result);
    }
  }
];
