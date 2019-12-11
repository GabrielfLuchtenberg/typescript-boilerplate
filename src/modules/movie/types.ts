interface IGenre {
  id: number;
  name: string;
}

interface ITMDBMovie {
  id: number;
  imdb_id: string;
  genres: IGenre[];
  original_title: string;
  poster_path: string;
  release_date: string;
  overview?: string;
}

interface IMovie {
  id: number;
  genres: IGenre[];
  name: string;
  posters: string[];
  release_date: string;
}

interface IMovieDetails extends IMovie {
  overview: string;
}

interface IPage<T> {
  page: number;
  results: T[];
}
