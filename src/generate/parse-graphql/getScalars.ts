import gql from 'graphql-tag';

export default (graphqlString: string) => {
  const graphqlAST = gql`
    ${graphqlString}
  `;

  // @ts-ignore
  return graphqlAST.definitions.filter((d) => d.kind === 'ScalarTypeDefinition').map((f) => f.name.value);
};
