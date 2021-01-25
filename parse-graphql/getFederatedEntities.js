const gql = require('graphql-tag');
module.exports = (graphqlString) => {
  const graphqlAST = gql`
    ${graphqlString}
  `;

  return graphqlAST.definitions
    .filter((d) => ['Mutation', 'Query', 'Subscription'].indexOf(d.name.value) === -1)
    .filter((d) => ['ObjectTypeDefinition', 'ObjectTypeExtension'].indexOf(d.kind) > -1)
    .filter((d) => {
      return d.directives && d.directives.find((d) => d.name.value === 'key');
    })
    .map((f) => f.name.value);
};
