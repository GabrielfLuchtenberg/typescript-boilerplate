import { upcoming, get as getMovie } from "./api-loader";

interface ListArgs {
  limit?: number;
  page?: number;
}
interface GetArgs {
  id: number;
}

export const list = async ({ page = 1, limit = 20 }: ListArgs = {}) => {
  const movies = await upcoming(limit, page);
  const moviesPage: Page<Movie> = {
    page,
    results: movies
  };
  return moviesPage;
};

export const get = async ({ id }: GetArgs): Promise<MovieDetails> => {
  const movie = await getMovie(id);
  return movie;
};
