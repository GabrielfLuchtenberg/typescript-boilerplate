import { createService } from "./service";

interface ListArgs {
  name?: string;
  limit?: number;
  page?: number;
}
interface GetArgs {
  id: number;
}

const service = createService();
export const list = async (args: ListArgs = {}): Promise<Page<Movie>> => {
  return service.list(args);
};

export const get = async ({ id }: GetArgs): Promise<MovieDetails> => {
  return service.get(id);
};
