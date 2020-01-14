import { Router } from "express";
import { IRoute } from "../types";

type Wrapper = (router: Router) => void;

export const applyMiddleware = (middleware: Wrapper[], router: Router) => {
  for (const f of middleware) {
    f(router);
  }
};

export const applyRoutes = (routes: IRoute[], router: Router) => {
  for (const route of routes) {
    const { method, path, handler } = route;
    (router as any)[method](path, handler);
  }
};
