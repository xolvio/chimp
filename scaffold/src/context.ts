import express from "express";
import { RootInterface } from "./root";
import { dataSources } from "./dataSources";

export type GqlContext = AppContext & {
  dataSources: ReturnType<typeof dataSources>;
};

export type AppContext = RootInterface & {
  headers: {
    [key: string]: string | string[];
  };
  jwt?: string;
};

export const appContext = (root: RootInterface) => ({
  req,
}: {
  req: express.Request;
}): AppContext => {
  return {
    ...root,
    headers: req.headers,
    jwt: req.cookies.jwt,
  };
};
