interface Args {
  name: string;
}

export const hello = async ({ name }: Args) => {
  return Promise.resolve(`Hello ${name}`);
};
