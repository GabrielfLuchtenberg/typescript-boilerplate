import { tdbmApi } from "../../infrastructure/apis/tdbm";

const defaultNumberOfResponses = 20;

const getNumberOfRequests = (limit: number) =>
  Math.ceil(limit / defaultNumberOfResponses);

const fetchPage = async (page: number) =>
  tdbmApi.get<Page<TMDBMovie>>("movie/upcoming", {
    params: { page }
  });

const fetchTimes = async (
  times: number,
  initialPage: number = 1
): Promise<Array<Page<TMDBMovie>>> => {
  const promises = [];
  for (let page = initialPage; page <= times + initialPage - 1; page++) {
    promises.push(fetchPage(page));
  }
  const solvedPromises = await Promise.all(promises);
  const pages = solvedPromises.reduce(
    (prev: Array<Page<TMDBMovie>>, curr) => [...prev, curr.data],
    []
  );
  return pages;
};

const mergeMoviesPagesIntoMovies = (
  pages: Array<Page<TMDBMovie>>
): TMDBMovie[] => {
  return pages.reduce((prev: TMDBMovie[], current): TMDBMovie[] => {
    return [...prev, ...current.results];
  }, []);
};

const fetchFromApi = async ({
  page,
  limit
}: {
  page: number;
  limit: number;
}): Promise<TMDBMovie[]> => {
  const numberOfRequests = getNumberOfRequests(limit);
  const pages = await fetchTimes(numberOfRequests, page);
  const movies = mergeMoviesPagesIntoMovies(pages);
  return movies;
};
const limitMovies = (movies: TMDBMovie[], limit: number) =>
  movies.splice(0, limit);

const parseMovies = (movies: TMDBMovie[]) => {
  const parse = (movie: TMDBMovie): Movie => {
    const {
      id,
      imdb_id,
      original_title: name,
      poster_path: poster,
      genres,
      release_date
    } = movie;

    return { id, imdb_id, name, poster, genres, release_date };
  };

  return movies.reduce(
    (prev: Movie[], curr: TMDBMovie) => [...prev, parse(curr)],
    []
  );
};

export const upcoming = async (
  limit: number = 20,
  page: number = 1
): Promise<Movie[]> => {
  const apiMovies = await fetchFromApi({ page, limit });
  const movies = parseMovies(limitMovies(apiMovies, limit));

  return movies;
};
