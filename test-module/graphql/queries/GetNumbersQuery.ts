import { QueryResolvers } from "~generated/graphql/types";

export const GetNumbersQuery: QueryResolvers["GetNumbers"] = (
  parent,
  args,
  context
) => {
  return { one: 1, two: 2, three: 3 };
};
