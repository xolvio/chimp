const gql = require('graphql-tag');
module.exports = (graphqlString) => {
  const graphqlAST = gql`
    ${graphqlString}
  `;
  let foundQueries = graphqlAST.definitions.find((d) => d.name.value === 'Query');
  let foundMutations = graphqlAST.definitions.find((d) => d.name.value === 'Mutation');
  return {
    queries:
      foundQueries &&
      foundQueries.fields.map((f) => ({
        name: f.name.value,
        hasArguments: !!f.arguments.length,
        variables: f.arguments.map((a) => a.name.value),
      })),
    mutations:
      foundMutations &&
      foundMutations.fields.map((f) => ({
        name: f.name.value,
        hasArguments: !!f.arguments.length,
        variables: f.arguments.map((a) => a.name.value),
      })),
    typeDefinitions: graphqlAST.definitions
      .filter((d) => ['Mutation', 'Query', 'Subscription'].indexOf(d.name.value) === -1)
      .filter((d) => ['ObjectTypeDefinition', 'ObjectTypeExtension'].indexOf(d.kind) > -1)
      .map((f) => ({ name: f.name.value })),
  };
};
