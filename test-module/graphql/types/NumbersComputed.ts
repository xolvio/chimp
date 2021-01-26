import { NumbersResolvers } from "@generated/graphql/types";

export const NumbersComputed: NumbersResolvers["computed"] = (
  parent,
  args,
  context
) => {
  return `${parent.one} ${parent.two} ${parent.three}`;
};
