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
  overview?: string;
}

interface Movie {
  id: number;
  genres: Genre[];
  name: string;
  posters: string[];
  release_date: string;
}

interface MovieDetails extends Movie {
  overview: string;
}

interface Page<T> {
  page: number;
  results: T[];
}
