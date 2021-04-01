const fs = require('fs');
const { pascalCase } = require('pascal-case');
const { isObjectType, Source, buildSchema } = require('graphql');

let schemaString = fs
  .readFileSync('./schema.graphql')
  .toString()
  .replace(/extend type/g, `type`);

schemaString = `${schemaString}

## Federation Types

scalar _FieldSet

directive @external on FIELD_DEFINITION
directive @requires(fields: _FieldSet!) on FIELD_DEFINITION
directive @provides(fields: _FieldSet!) on FIELD_DEFINITION
directive @key(fields: _FieldSet!) on OBJECT | INTERFACE

directive @extends on OBJECT

scalar Upload
`
  .replace('@entity(embedded: Boolean)', '@entity(embedded: Boolean, additionalFields: [AdditionalEntityFields])')
  .replace(
    '@union(discriminatorField: String)',
    '@union(discriminatorField: String, additionalFields: [AdditionalEntityFields])',
  )
  .replace('@chimp(embedded: Boolean)', '@chimp(embedded: Boolean, additionalFields: [AdditionalEntityFields])');

const source = new Source(schemaString);
const schema = buildSchema(source, { assumeValidSDL: true });
const typeMap = schema.getTypeMap();

const getConfig = (type) => (type.toConfig ? type.toConfig().astNode : type.astNode);

const mappers = {};
for (const typeName in typeMap) {
  const type = schema.getType(typeName);
  if (isObjectType(type)) {
    if (getConfig(type)) {
      if (!['Query', 'Mutation', 'Subscription'].includes(getConfig(type).name.value)) {
        mappers[typeName] = `${pascalCase(typeName)}DbObject`;
      }
    }
  }
}

module.exports = function ({ contextType } = {}) {
  return {
    overwrite: true,
    schema: schemaString,
    generates: {
      'generated/graphql/types.ts': {
        config: {
          contextType: contextType || `${process.env.APP_PREFIX}/context#GqlContext`,
          idFieldName: 'id',
          objectIdType: 'string',
          federation: true,
          mappers,
          scalars: {
            Upload: 'Promise<GraphQLFileUpload>',
          },
        },
        plugins: [
          'typescript',
          'typescript-resolvers',
          'typescript-operations',
          'chimp-graphql-codegen-plugin',
          { add: 'export {GqlContext};' },
          {
            add: `
            import { ReadStream } from "fs-capacitor";
          interface GraphQLFileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream(options?:{encoding?: string, highWaterMark?: number}): ReadStream;
}`,
          },
        ],
      },
    },
  };
};
