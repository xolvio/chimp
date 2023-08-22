import { buildSubgraphSchema } from '@apollo/subgraph';
import { loadTypedefsSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { resolvers } from '~app/resolvers';

const graphqlPaths = `${__dirname}/**/*.graphql`;

const typeDefs = mergeTypeDefs(
  loadTypedefsSync([graphqlPaths], {
    loaders: [new GraphQLFileLoader()],
    assumeValidSDL: true, // bypassing validation because the files in isolation are not valid, only after compiling together
  }).map((s) => {
    return s.document!;
  }),
);

export const schema = buildSubgraphSchema([
  {
    typeDefs,
    resolvers,
  },
]);
