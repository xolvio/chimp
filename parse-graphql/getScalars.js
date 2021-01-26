const gql = require('graphql-tag');
module.exports = (graphqlString) => {
  const graphqlAST = gql`
    ${graphqlString}
  `;

  return graphqlAST.definitions.filter((d) => d.kind === 'ScalarTypeDefinition').map((f) => f.name.value);
};
