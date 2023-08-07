import { RootInterface } from "./root";

export type GqlContext = RootInterface & { req: RequestType };

type RequestType = {
  headers: {
    [key: string]: string | string[] | undefined;
  };
  jwt?: string;
};

export const appContext =
  (root: RootInterface) =>
    async ({ req }: { req: RequestType }): Promise<GqlContext> => {
      return {
        ...root,
        req,
      };
    };
