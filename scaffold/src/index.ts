import { createApp } from "./createApp";

const port = process.env.PORT || 4000
createApp().listen({ port }, () =>
  console.log(`🚀 Server ready at http://localhost:${port}/graphql`)
);
