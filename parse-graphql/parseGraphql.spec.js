const parseGraphql = require('./parseGraphql');
const gql = (a) => a[0];
const queryString = gql`
  extend type Query {
    me: User
    notMe: User
  }

  extend type Mutation {
    UserChangeName(name: String!): User!
  }

  type User {
    id: ID!
    name: String
    username: String
    birthDate: String
  }

  interface MyUser {
    test: String
  }

  type OtherUser {
    test: ID
  }

  extend type ExtendedUser {
    someData: String
  }
`;

test('should return names of the queries', () => {
  const res = parseGraphql(queryString);
  expect(res.queries).toMatchObject([{ name: 'me' }, { name: 'notMe' }]);
});

test('should return names of types', () => {
  const res = parseGraphql(queryString);
  expect(res.typeDefinitions).toEqual([{ name: 'User' }, { name: 'OtherUser' }, { name: 'ExtendedUser' }]);
});

test('should return names of the Mutations', () => {
  const res = parseGraphql(queryString);
  expect(res.mutations).toMatchObject([{ name: 'UserChangeName' }]);
});

test('do not throw if queries not found', () => {
  const queryString = gql`
    extend type Mutation {
      UserChangeName(name: String!): User!
    }

    type User {
      id: ID!
      name: String
      username: String
      birthDate: String
    }

    interface MyUser {
      test: String
    }

    type OtherUser {
      test: ID
    }

    extend type ExtendedUser {
      someData: String
    }
  `;
  parseGraphql(queryString);
});

test('do not throw if mutations not found', () => {
  const queryString = gql`
    extend type Query {
      me: User
      notMe: User
    }

    type User {
      id: ID!
      name: String
      username: String
      birthDate: String
    }

    interface MyUser {
      test: String
    }

    type OtherUser {
      test: ID
    }

    extend type ExtendedUser {
      someData: String
    }
  `;

  parseGraphql(queryString);
});

test('do not throw if types not found', () => {
  const queryString = gql`
    extend type Query {
      me: User
      notMe: User
    }

    extend type Mutation {
      UserChangeName(name: String!): User!
    }
  `;

  const res = parseGraphql(queryString);
});

test('should return arguments list for query', () => {
  const queryString = gql`
    extend type Query {
      UserChangeName(name: String!, age: Int): String!
      NoArguments: String!
    }
  `;
  const res = parseGraphql(queryString);

  expect(res.queries).toMatchObject([
    { name: 'UserChangeName', variables: ['name', 'age'] },
    { name: 'NoArguments', variables: [] },
  ]);
});

test('should return arguments list for mutation', () => {
  const queryString = gql`
    extend type Mutation {
      UserChangeName(name: String!, age: Int): String!
      NoArguments: String!
    }
  `;
  const res = parseGraphql(queryString);

  expect(res.mutations).toMatchObject([
    { name: 'UserChangeName', variables: ['name', 'age'] },
    { name: 'NoArguments', variables: [] },
  ]);
});
