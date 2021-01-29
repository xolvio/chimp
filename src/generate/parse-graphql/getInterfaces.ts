import gql from 'graphql-tag';

export default (graphqlString: string) => {
  const graphqlAST = gql`
    ${graphqlString}
  `;

  return (
    graphqlAST.definitions
      .filter((d) => ['InterfaceTypeDefinition'].indexOf(d.kind) > -1)
      // @ts-ignore
      .map((f) => f.name.value)
  );
};
