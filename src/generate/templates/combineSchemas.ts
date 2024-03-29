import { loadTypedefsSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { mergeTypeDefs } from '@graphql-tools/merge';

const graphqlPaths = `${process.env.PROJECT_PATH || ''}/src/**/*.graphql`;
const graphqlFrameworkPath = `${process.env.PROJECT_PATH || ''}/generated/graphql/genericDataModelSchema.graphql`;

const schema = mergeTypeDefs(
  loadTypedefsSync([graphqlPaths, graphqlFrameworkPath], {
    loaders: [new GraphQLFileLoader()],
    assumeValidSDL: true, // bypassing validation because the files in isolation are not valid, only after compiling together
  }).map((s) => {
    return s.document!;
  }),
);

export default schema;
