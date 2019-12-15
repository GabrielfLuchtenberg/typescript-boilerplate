import { MovieCacheLoader, GenreCacheLoader } from "./loaders/cache-loader";
import { redis } from "../../infrastructure/cache/redis";
import { ICacheLoader } from "../../infrastructure/cache/create-loader";
import { filterMovies } from "./parsers";
import { upcoming, get as getMovie } from "./loaders/api-loader";
import { IMovieDetails, IMovie, IPage, IGenre } from "./types";
import { tdbmApi } from "../../infrastructure/apis/tdbm";

const cacheLoader = MovieCacheLoader(redis);
const genreCacheLoader = GenreCacheLoader(redis);
interface IListArgs {
  name?: string;
  limit?: number;
  page?: number;
}

interface IMovieService {
  list: (args?: IListArgs) => Promise<IPage<IMovie>>;
  get: (id: number) => Promise<IMovieDetails>;
}

const createService = (
  cache: ICacheLoader<IMovieDetails> = cacheLoader,
  genreCache: ICacheLoader<IGenre> = genreCacheLoader
): IMovieService => {
  const getGenres = async (ids: number[]): Promise<IGenre[]> => {
    const genres = await genreCache.list(ids);
    if (genres.length > 0) {
      return genres;
    }

    const apiGenres = await tdbmApi.get<{ genres: IGenre[] }>(
      `/genre/movie/list`
    );
    const promises = apiGenres.data.genres.map(async genre =>
      genreCache.set(genre.id, genre)
    );
    await Promise.all(promises);
    return apiGenres.data.genres.filter(genre => ids.includes(genre.id));
  };

  const createMovieWithGenres = async (movie: IMovie): Promise<IMovie> => {
    const genres = await getGenres(movie.genre_ids);
    return { ...movie, genres };
  };

  const formatMovies = async (movies: IMovie[]): Promise<IMovie[]> => {
    const promises = movies.map(movie => createMovieWithGenres(movie));
    const data = await Promise.all(promises);
    return data;
  };

  const list = async ({ name, page = 1, limit = 20 }: IListArgs = {}) => {
    const movies = await upcoming(limit, page);
    const formattedMovies = await formatMovies(movies);

    if (name) {
      return { page, results: filterMovies(formattedMovies, name) };
    }
    return {
      page,
      results: formattedMovies
    };
  };

  const get = async (id: number): Promise<IMovieDetails> => {
    const cachedMovie = await cache.get(id);
    if (cachedMovie) {
      return cachedMovie;
    }

    const movie = await getMovie(id);
    cache.set(id, movie);
    return movie;
  };
  return { get, list };
};
export { createService };
