import {loadTypedefsSync} from "@graphql-tools/load";
import {
  GraphQLFileLoader,
  GraphQLFileLoaderOptions,
} from "@graphql-tools/graphql-file-loader";
import { mergeTypeDefs } from "@graphql-tools/merge";

import shelljs from "shelljs";

const graphqlPaths = shelljs.ls(
  `${__dirname}/../../src/**/*.graphql`
);

class ExtendedGraphQLFileLoader extends GraphQLFileLoader {
  handleFileContent(
    rawSDL: string,
    pointer: string,
    options: GraphQLFileLoaderOptions
  ) {
    const newSdl = rawSDL
      .replace("extend type Query", "type Query")
      .replace("extend type Mutation", "type Mutation");
    // .replace(/extend type/g, "type");
    return super.handleFileContent(newSdl, pointer, options);
  }
}

const userSchema = loadTypedefsSync(graphqlPaths, {
  loaders: [new ExtendedGraphQLFileLoader()],
  assumeValidSDL: true, // this will bypass validation
}).map((s) => { return s.document! } )

const frameworkTypes = loadTypedefsSync(`
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

`, {loaders: []}).map((s) => s.document!)

const schema = mergeTypeDefs(
  userSchema.concat(frameworkTypes)
);

export default schema;
