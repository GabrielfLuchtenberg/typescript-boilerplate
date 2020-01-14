import { createService } from "./service";
import { IMovie, IPage, IMovieDetails } from "./types";

interface IListArgs {
  name?: string;
  limit?: number;
  page?: number;
}
interface IGetArgs {
  id: number;
}

const movieService = createService();
export const list = async (args: IListArgs = {}): Promise<IPage<IMovie>> => {
  return movieService.list(args);
};

export const get = async ({ id }: IGetArgs): Promise<IMovieDetails> => {
  return movieService.get(id);
};
