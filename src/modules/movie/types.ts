interface Genre {
  id: number;
  name: string;
}

interface TMDBMovie {
  id: number;
  imdb_id: string;
  genres: Genre[];
  original_title: string;
  poster_path: string;
  release_date: string;
}

interface Movie {
  id: number;
  imdb_id: string;
  genres: Genre[];
  name: string;
  poster: string;
  release_date: string;
}
interface Page<T> {
  page: number;
  results: T[];
}
