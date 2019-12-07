import { upcoming } from "./api-loader";

interface Args {
  limit?: number;
  page?: number;
}

export const list = async ({ page = 1, limit = 20 }: Args = {}) => {
  const movies = await upcoming(limit, page);
  const moviesPage: Page<Movie> = {
    page,
    results: movies
  };
  return moviesPage;
};
