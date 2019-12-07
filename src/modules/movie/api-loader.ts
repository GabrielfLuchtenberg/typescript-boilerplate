import { tdbmApi } from "../../infrastructure/apis/tdbm";

const defaultNumberOfResponses = 20;

const getNumberOfRequests = (limit: number) =>
  Math.ceil(limit / defaultNumberOfResponses);

const fetchPage = async (page: number) =>
  tdbmApi.get<Page<Movie>>("movie/upcoming", {
    params: { page }
  });

const fetchTimes = async (
  times: number,
  initialPage: number = 1
): Promise<Array<Page<Movie>>> => {
  const promises = [];
  for (let page = initialPage; page <= times + initialPage - 1; page++) {
    promises.push(fetchPage(page));
  }
  const solvedPromises = await Promise.all(promises);
  const pages = solvedPromises.reduce(
    (prev: Array<Page<Movie>>, curr) => [...prev, curr.data],
    []
  );
  return pages;
};

const mergeMoviesPages = (pages: Array<Page<Movie>>): Movie[] => {
  return pages.reduce((prev: Movie[], current): Movie[] => {
    return [...prev, ...current.results];
  }, []);
};

const fetchFromApi = async ({
  page,
  limit
}: {
  page: number;
  limit: number;
}): Promise<Movie[]> => {
  const numberOfRequests = getNumberOfRequests(limit);
  const pages = await fetchTimes(numberOfRequests, page);
  const movies = mergeMoviesPages(pages);
  return movies;
};
const limitMovies = (movies: Movie[], limit: number) => movies.splice(0, limit);

export const upcoming = async (
  limit: number = 20,
  page: number = 1
): Promise<Movie[]> => {
  const apiMovies = await fetchFromApi({ page, limit });
  const movies = limitMovies(apiMovies, limit);
  return movies;
};
