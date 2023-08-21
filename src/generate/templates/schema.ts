// if someone wants to use this generator without federation that's completely fine and we don't want this file to cause a typescript error.

import { buildSubgraphSchema } from '@apollo/subgraph';
import { resolvers } from '{{generatedPrefix}}/graphql/resolvers';
import gqltag from 'graphql-tag';

const typeDefs = gqltag`{{{schemaString}}}`;

const schema = buildSubgraphSchema([
  {
    typeDefs,
    resolvers,
  },
]);

export { schema };
