import td from "testdouble";
import {
  GqlContext,
  testGetNumbers,
} from "@generated/graphql/helpers/GetNumbersQuerySpecWrapper";

test("GetNumbers", async () => {
  const context = td.object<GqlContext>();

  // td.when(context.TestRepository.findOne()).thenResolve()

  const result = await testGetNumbers(context);
});
