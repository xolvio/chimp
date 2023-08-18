import { loadTypedefsSync } from '@graphql-tools/load';
import { GraphQLFileLoader, GraphQLFileLoaderOptions } from '@graphql-tools/graphql-file-loader';
import { mergeTypeDefs } from '@graphql-tools/merge';
// @ts-ignore
import shelljs from 'shelljs';
import debugConfigurator from 'debug';

const debug = debugConfigurator('combineSchemas.ts');

const graphqlPaths = shelljs.ls(`${process.env.PROJECT_PATH || ''}/src/**/*.graphql`);
debug(
  'path to GraphQL Schemas',
  graphqlPaths.filter((p) => p),
);

class ExtendedGraphQLFileLoader extends GraphQLFileLoader {
  handleFileContent(rawSDL: string, pointer: string, options: GraphQLFileLoaderOptions) {
    const newSdl = rawSDL.replace('extend type Query', 'type Query').replace('extend type Mutation', 'type Mutation');
    // .replace(/extend type/g, "type");
    return super.handleFileContent(newSdl, pointer, options);
  }
}

const userSchema = loadTypedefsSync(graphqlPaths, {
  loaders: [new ExtendedGraphQLFileLoader()],
  assumeValidSDL: true, // this will bypass validation
}).map((s) => {
  return s.document!;
});

const frameworkTypes = loadTypedefsSync(
  `
# Generated directives
directive @entity(embedded: Boolean) on OBJECT
directive @chimp(embedded: Boolean) on OBJECT

directive @column(overrideType: String) on FIELD_DEFINITION

directive @id on FIELD_DEFINITION
directive @computed on FIELD_DEFINITION
directive @link(overrideType: String) on FIELD_DEFINITION
directive @embedded on FIELD_DEFINITION
directive @map(path: String!) on FIELD_DEFINITION
directive @union(discriminatorField: String) on UNION

input AdditionalEntityFields {
  path: String
  type: String
}

directive @predefined on SCALAR
`,
  { loaders: [] },
).map((s) => s.document!);

// eslint-disable-next-line unicorn/prefer-spread
const schema = mergeTypeDefs(userSchema.concat(frameworkTypes));

export default schema;
