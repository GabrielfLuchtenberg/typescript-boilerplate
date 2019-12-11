import { createService } from "./service";

interface IListArgs {
  name?: string;
  limit?: number;
  page?: number;
}
interface IGetArgs {
  id: number;
}

const service = createService();
export const list = async (args: IListArgs = {}): Promise<IPage<IMovie>> => {
  return service.list(args);
};

export const get = async ({ id }: IGetArgs): Promise<IMovieDetails> => {
  return service.get(id);
};
