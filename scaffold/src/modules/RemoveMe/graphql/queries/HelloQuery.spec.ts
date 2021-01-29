import td from "testdouble";
import { GqlContext, QueryHelloArgs } from "~generated/graphql/types";
import { HelloQuery } from "./HelloQuery";

const testHello = (variables: QueryHelloArgs, context: GqlContext) =>
  HelloQuery({}, variables, context, null);

test("Hello", async () => {
  const context = td.object<GqlContext>();

  const variables: QueryHelloArgs = { greeting: "Hello there!" };

  const result = await testHello(variables, context);

  expect(result).toEqual("Hello there!");
});
