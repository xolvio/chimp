import gql from 'graphql-tag';

type parsedGraphQL = {
  queries: { name: string; hasArguments: boolean; variables: string[] }[];
  mutations: { name: string; hasArguments: boolean; variables: string[] }[];
  typeDefinitions: { name: string }[];
};

export default function (graphqlString: string): parsedGraphQL {
  const graphqlAST = gql`
    ${graphqlString}
  `;
  // @ts-ignore
  const foundQueries = graphqlAST.definitions.find((d) => d.name.value === 'Query');
  // @ts-ignore
  const foundMutations = graphqlAST.definitions.find((d) => d.name.value === 'Mutation');
  return {
    queries:
      foundQueries &&
      // @ts-ignore
      foundQueries.fields.map((f) => ({
        name: f.name.value as string,
        hasArguments: f.arguments.length > 0,
        variables: f.arguments.map((a: { name: { value: string } }) => a.name.value),
      })),
    mutations:
      foundMutations &&
      // @ts-ignore
      foundMutations.fields.map((f) => ({
        name: f.name.value,
        hasArguments: f.arguments.length > 0,
        variables: f.arguments.map((a: { name: { value: string } }) => a.name.value),
      })),
    typeDefinitions: graphqlAST.definitions
      // @ts-ignore
      .filter((d) => !['Mutation', 'Query', 'Subscription'].includes(d.name.value))
      .filter((d) => ['ObjectTypeDefinition', 'ObjectTypeExtension'].includes(d.kind))
      // @ts-ignore
      .map((f) => ({ name: f.name.value })),
  };
}
