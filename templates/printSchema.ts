// @ts-ignore
const { print } = require("graphql");
const schema = require("chimp/runtime-config-helpers/combineSchemas").default
// @ts-ignore
console.log(print(schema));
