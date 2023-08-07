import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { json } from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import http from "http";
import { schema } from "~generated/graphql/schema";
import { GqlContext, appContext } from "~app/context";
import { root } from "./root";

const apollo = new ApolloServer<GqlContext>({
  schema,
});

apollo.start().then(async () => {
  const app = express();
  app.use([cookieParser()]);
  const httpServer = http.createServer(app);

  const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true,
  };

  app.use(
    "/graphql",
    cors<cors.CorsRequest>(corsOptions),
    json(),
    expressMiddleware(apollo, {
      context: appContext(root),
    }),
  );

  const port = process.env.PORT || 4000;
  httpServer.listen({ port }, () => {
    console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
  });
});
