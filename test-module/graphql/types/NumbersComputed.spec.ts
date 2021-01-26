import td from "testdouble";
import {
  GqlContext,
  ParentType,
  testNumbersComputed,
} from "@generated/graphql/helpers/NumbersComputedSpecWrapper";

test("NumbersComputed", async () => {
  const context = td.object<GqlContext>();
  // td.when(context.TestRepository.findOne()).thenResolve()
  const parent = {} as ParentType;

  // const result = await testNumbersComputed(parent,  context);
});
