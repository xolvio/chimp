## Setup

`npm install`


## Development

Start the backend in dev (watch) mode:

`npm start`

To run tests:

`npm test`

To run tests in watch mode:

`npm run test:watch`

To run type check:

`npm run type-check`

To run lint:

`npm run lint`

## Type Generation / Workflow

Your schema files have to be in a structure of `./src/modules/MODULE_NAME/graphql/MODULE_NAME.graphql`, for example `./src/modules/Lists/graphql/Lists.graphql`.

Anytime you modify one of your graphql files remember to run `npm run graphql:generateAll`.

It will create Mutations/Queries/Type resolvers, tests for them, types and perform all the necessary connection between the main schema, contexts, etc.
It's advisable to create a new module, fill it with schema, run the generation to see what are the resulting changes.
Remember to start with a clean, commited state. It's difficult to compare and verify the generation results if you've had changes in the code already, so that's blocked by default.
The tooling will only allow you to run the generation if there are no changes, or if .graphql files are the only one changed.

Let's assume we've created a new module named Users:

`mkdir -p src/modules/Users/graphql`

And now create a simple schema file for it `src/modules/Users/graphql/Users.graphql`:

```graphql
type User {
  id: ID!
  name: String
}

extend type Query {
  UserById(id: ID!): User!
}

extend type Mutation {
  UserAdd(name: String!): User!
}
```

> Please note, we extend Queries and Mutations, as those are defined something else - that helps IDEs to understand that we don't have conflicting types defined in our project

Let's run the generation now:

`npm run graphql:generateAll`
