import { GraphQLScalarType, Kind } from "graphql";

function oddValue(value: unknown) {
  if (typeof value !== "number") {
    return null;
  }
  return value % 2 === 1 ? value : null;
}

export const Odd: GraphQLScalarType = new GraphQLScalarType({
  name: "Odd",
  description: "Odd custom scalar type",
  parseValue: oddValue,
  serialize: oddValue,
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return oddValue(parseInt(ast.value, 10));
    }
    return null;
  },
});
