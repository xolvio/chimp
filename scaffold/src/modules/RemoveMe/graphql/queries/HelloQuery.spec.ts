import td from "testdouble";
import {
  GqlContext,
  QueryHelloArgs,
  testHello,
} from "~generated/graphql/helpers/HelloQuerySpecWrapper";

test("Hello", async () => {
  const context = td.object<GqlContext>();

  const variables: QueryHelloArgs = { greeting: "Hello there!" };

  const result = await testHello(variables, context);

  expect(result).toEqual("Hello there!");
});
