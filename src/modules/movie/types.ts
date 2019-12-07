interface Genre {
  id: number;
  name: string;
}

interface Movie {
  id: number;
  imdb_id: string;
  genres: Genre[];
  original_title: string;
  title: string;
  poster_path: string;
  release_date: string;
}
interface Page<T> {
  page: number;
  results: T[];
}
