import { NextFunction } from "express";

export type Handler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

export interface IRoute {
  path: string;
  method: string;
  handler: Handler | Handler[];
}
