const fs = require("fs");
const { importSchema } = require("graphql-import");
const { isObjectType } = require("graphql");

let schemaString = fs
  .readFileSync("./schema.graphql")
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
`
  .replace(
    "@entity(embedded: Boolean)",
    "@entity(embedded: Boolean, additionalFields: [AdditionalEntityFields])"
  )
  .replace(
    "@union(discriminatorField: String)",
    "@union(discriminatorField: String, additionalFields: [AdditionalEntityFields])"
  )
  .replace(
    "@chimp(embedded: Boolean)",
    "@chimp(embedded: Boolean, additionalFields: [AdditionalEntityFields])"
  );

const schema = importSchema(schemaString, {}, { out: "GraphQLSchema" });
const typeMap = schema.getTypeMap();

const mappers = {};
for (const typeName in typeMap) {
  const type = schema.getType(typeName);
  if (isObjectType(type)) {
    if (type.toConfig().astNode) {
      if (
        !["Query", "Mutation", "Subscription"].includes(
          type.toConfig().astNode.name.value
        )
      ) {
        mappers[typeName] = `${typeName}DbObject`;
      }
    }
  }
}


module.exports = function({contextType,} = {}) {
  return {
    overwrite: true,
    schema: schemaString,
    generates: {
      "generated/graphql/types.ts": {
        config: {
          contextType: contextType || "{{appPrefix}}/context#GqlContext",
          idFieldName: "id",
          objectIdType: "string",
          federation: true,
          mappers
        },
        plugins: [
          "typescript",
          "typescript-resolvers",
          "typescript-operations",
          "chimp-graphql-codegen-plugin",
          {add: "export {GqlContext};"},
        ],
      },
    },
  };
}
