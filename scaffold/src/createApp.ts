import { ApolloServer } from "apollo-server-express";
import express from "express";
import cookieParser from "cookie-parser";
import { schema } from "~generated/graphql/schema";
import { appContext } from "~app/context";
import { dataSources } from "./dataSources";
import { root } from "./root";


export const createApp =  () => {
  const app = express();

  app.use([cookieParser()]);

  const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true
  }

  const apollo = new ApolloServer({
    schema,
    dataSources,
    context: appContext(root),
  });

  apollo.applyMiddleware({ app, cors: corsOptions });

  return app;
};

