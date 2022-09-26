import getUnions from './getUnions';

const gql = (a: TemplateStringsArray) => a[0];

test('get the unions', () => {
  const schemaString = gql`
    type Query {
      homes: [Home]
    }

    type Cottage {
      id: ID!
      address: String!
    }

    type Villa {
      id: ID!
      address: String!
      owner: String!
    }

    union Home = Cottage | Villa
  `;

  const res = getUnions(schemaString);

  expect(res).toEqual(['Home']);
});
test('should throw exception if duplicate union names are found', () => {
  const schemaString = gql`
    type Query {
      homes: [Home]
    }

    type Cottage {
      id: ID!
      address: String!
    }

    type Villa {
      id: ID!
      address: String!
      owner: String!
    }

    union Home = Cottage | Villa
    union Home = Cottage | Villa
  `;

  expect(() => getUnions(schemaString)).toThrow('Duplicate union name found: Home');
});
