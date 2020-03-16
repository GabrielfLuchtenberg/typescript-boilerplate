import "dotenv/config";
import http from "http";
import express from "express";
import { createDatabase } from "infrastructure/create-database";

import { handleProcessException } from "./infrastructure/process-exception";
import ErrorHandlers from "./application/middleware/error-handler";
import { applyMiddleware, applyRoutes } from "./application/utils";
import middleware from "./application/middleware";
import routes from "./application";

(async () => {
  const { PORT = 3000, MONGO_URL = "mongodb://localhost/poc" } = process.env;

  try {
    createDatabase(MONGO_URL);
  } catch (e) {
    console.error("Unable to connect to database");
    process.exit(1);
  }

  handleProcessException();

  const router = express();

  applyMiddleware(middleware, router);
  applyRoutes(routes as any, router);
  applyMiddleware(ErrorHandlers, router);
  const server = http.createServer(router);

  server.listen(PORT, () =>
    console.log(`Server is running http://localhost:${PORT}...`)
  );
})();
