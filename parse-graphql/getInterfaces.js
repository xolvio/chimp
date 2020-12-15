const gql = require('graphql-tag');
module.exports = (graphqlString) => {
  const graphqlAST = gql`
    ${graphqlString}
  `;

  return graphqlAST.definitions
    .filter((d) => ['InterfaceTypeDefinition'].indexOf(d.kind) > -1)
    .map((f) => f.name.value);
};
