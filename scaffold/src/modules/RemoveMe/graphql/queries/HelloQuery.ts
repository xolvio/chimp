import { QueryResolvers } from "@generated/graphql/types";

export const HelloQuery: QueryResolvers["Hello"] = (parent, args, context) => {
  return args.greeting;
};
