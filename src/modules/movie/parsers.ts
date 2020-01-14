import {
  ITMDBMovie,
  IMovieDetails,
  IMovie,
  IPage,
  ITMDBMovieDetails
} from "./types";

const createPostersURL = (
  posterPath: string,
  baseURL: string = process.env.TDBM_IMAGE_BASE_URL!
): string[] => {
  const sizes = ["w92", "w154", "w185", "w342", "w500", "w780", "original"];
  return sizes.map(size => `${baseURL}${size}/${posterPath}`);
};

export const parseMovie = (movie: ITMDBMovieDetails): IMovieDetails => {
  const {
    id,
    original_title: name,
    poster_path: poster,
    genres,
    release_date,
    overview
  } = movie;
  const posters = createPostersURL(poster);
  return {
    id,
    name,
    posters,
    genres,
    release_date,
    overview: overview!
  };
};

export const parseMovieList = (movies: ITMDBMovie[]) => {
  const parse = (movie: ITMDBMovie): IMovie => {
    const {
      id,
      original_title: name,
      poster_path: poster,
      genre_ids,
      release_date
    } = movie;
    const posters = createPostersURL(poster);
    return { id, name, posters, genre_ids, release_date };
  };

  return movies.reduce(
    (prev: IMovie[], curr: ITMDBMovie) => [...prev, parse(curr)],
    []
  );
};

export const mergeMoviesPagesIntoMovies = (
  pages: Array<IPage<ITMDBMovie>>
): ITMDBMovie[] => {
  return pages.reduce((prev: ITMDBMovie[], current): ITMDBMovie[] => {
    return [...prev, ...current.results];
  }, []);
};

export const fetchTimes = async (
  times: number,
  initialPage: number = 1,
  fetch: (args: any) => Promise<any>
): Promise<Array<IPage<ITMDBMovie>>> => {
  const promises = [];
  for (let page = initialPage; page <= times + initialPage - 1; page++) {
    promises.push(fetch(page));
  }

  const solvedPromises = await Promise.all(promises);
  const pages = solvedPromises.reduce(
    (prev: Array<IPage<ITMDBMovie>>, curr) => [...prev, curr.data],
    []
  );

  return pages;
};

const defaultNumberOfResponses = 20;
export const getNumberOfRequests = (limit: number) =>
  Math.ceil(limit / defaultNumberOfResponses);

export const filterMovies = (movies: IMovie[], name: string) =>
  movies.filter(value => value.name.toLowerCase().includes(name.toLowerCase()));
