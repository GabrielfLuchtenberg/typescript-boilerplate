import { Request, Response } from "express";
import { list } from "./controller";

export default [
  {
    path: "/v1/upcoming",
    method: "get",
    handler: async ({ body }: Request, res: Response) => {
      const result = await list(body);
      res.status(200).send(result);
    }
  }
];
