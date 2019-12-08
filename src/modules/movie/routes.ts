import { Request, Response } from "express";
import { list, get } from "./controller";

const routePrefix = "/v1/movie";

export default [
  {
    path: `${routePrefix}/upcoming`,
    method: "get",
    handler: async ({ query }: Request, res: Response) => {
      const result = await list(query);
      res.status(200).send(result);
    }
  },

  {
    path: `${routePrefix}/:id`,
    method: "get",
    handler: async ({ params }: Request, res: Response) => {
      const result = await get(params);
      res.status(200).send(result);
    }
  }
];
