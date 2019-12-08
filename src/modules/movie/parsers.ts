export const parseMovie = (movie: TMDBMovie): MovieDetails => {
  const {
    id,
    original_title: name,
    poster_path: poster,
    genres,
    release_date,
    overview
  } = movie;

  return {
    id,
    name,
    poster,
    genres,
    release_date,
    overview: overview!
  };
};

export const parseMovieList = (movies: TMDBMovie[]) => {
  const parse = (movie: TMDBMovie): Movie => {
    const {
      id,
      original_title: name,
      poster_path: poster,
      genres,
      release_date
    } = movie;

    return { id, name, poster, genres, release_date };
  };

  return movies.reduce(
    (prev: Movie[], curr: TMDBMovie) => [...prev, parse(curr)],
    []
  );
};

export const mergeMoviesPagesIntoMovies = (
  pages: Array<Page<TMDBMovie>>
): TMDBMovie[] => {
  return pages.reduce((prev: TMDBMovie[], current): TMDBMovie[] => {
    return [...prev, ...current.results];
  }, []);
};

export const fetchTimes = async (
  times: number,
  initialPage: number = 1,
  fetch: (args: any) => Promise<any>
): Promise<Array<Page<TMDBMovie>>> => {
  const promises = [];
  for (let page = initialPage; page <= times + initialPage - 1; page++) {
    promises.push(fetch(page));
  }
  const solvedPromises = await Promise.all(promises);
  const pages = solvedPromises.reduce(
    (prev: Array<Page<TMDBMovie>>, curr) => [...prev, curr.data],
    []
  );
  return pages;
};

const defaultNumberOfResponses = 20;
export const getNumberOfRequests = (limit: number) =>
  Math.ceil(limit / defaultNumberOfResponses);
