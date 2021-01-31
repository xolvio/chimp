import gql from 'graphql-tag';

export default (graphqlString: string): string[] => {
  const graphqlAST = gql`
    ${graphqlString}
  `;

  return (
    graphqlAST.definitions
      .filter((d) => d.kind === 'ScalarTypeDefinition')
      // @ts-ignore
      .map((f) => f.name.value)
      .filter((s) => s !== 'Upload')
  );
};
