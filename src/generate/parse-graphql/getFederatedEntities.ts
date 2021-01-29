import gql from 'graphql-tag';

export default (graphqlString: string) => {
  const graphqlAST = gql`
    ${graphqlString}
  `;

  return (
    graphqlAST.definitions
      // @ts-ignore
      .filter((d) => ['Mutation', 'Query', 'Subscription'].indexOf(d.name.value) === -1)
      .filter((d) => ['ObjectTypeDefinition', 'ObjectTypeExtension'].indexOf(d.kind) > -1)
      .filter((d) => {
        // @ts-ignore
        return d.directives && d.directives.find((d: { name: { value: string } }) => d.name.value === 'key');
      })
      // @ts-ignore
      .map((f) => f.name.value)
  );
};
