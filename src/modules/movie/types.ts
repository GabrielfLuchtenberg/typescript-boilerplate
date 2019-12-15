export interface IGenre {
  id: number;
  name: string;
}
interface IBaseITMDBMovie {
  id: number;
  imdb_id: string;
  original_title: string;
  poster_path: string;
  release_date: string;
}
export interface ITMDBMovieDetails extends IBaseITMDBMovie {
  genres: IGenre[];
  overview: string;
}
export interface ITMDBMovie extends IBaseITMDBMovie {
  genre_ids: number[];
}

interface IBaseMovie {
  id: number;
  name: string;
  posters: string[];
  release_date: string;
}
export interface IMovie extends IBaseMovie {
  genre_ids: number[];
  genres?: IGenre[];
}

export interface IMovieDetails extends IBaseMovie {
  overview: string;
  genres: IGenre[];
}

export interface IPage<T> {
  page: number;
  results: T[];
}
