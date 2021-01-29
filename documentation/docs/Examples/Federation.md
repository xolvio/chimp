---
id: Federation
title: Overview of a more realistic Example
---

Note: This repo was not updated to the chimp 3.0 yet.

In this section we will look at a setup that's typical to our clients.


This repository - https://github.com/xolvio/chimp-gql-federation-example  consists of 6 independent packages:

- `graphql-gateway` TypeScript thin layer powered by [Apollo Gateway](https://www.apollographql.com/docs/apollo-server/federation/gateway/)
- `graphql-todo-items` TypeScript Federated Graph responsible for Todo Items (and extending Lists)
- `graphql-todo-lists` TypeScript Federated Graph responsible for Todo Lists
- `microservice-todo-items` Kotlin Spring Microservice responsible for operations related to Todo Items
- `microservice-todo-lists` Kotlin Spring Microservice responsible for operations related to Todo Lists
- `web` React Frontend - a playground frontend that works with this architecture even though it was written over multiple years for a monolithic GraphQL / MongoDB server - but since the GraphQL Schema matches our Federated, it works just fine.


## Setup

`npm install`

Make sure you have docker running. Then start all the projects including a dockerized instance of mongodb.

`npm start`

## Development

Open graphql-todo-lists or graphql-todo-items

To run tests:

`npm test`

To run tests in watch mode:

`npm run test:watch`

To run type check:

`npm run type-check`

To run lint:

`npm run lint`

## Common functionality
Our example repo shows implementation examples for common functionalities - Pagination, Filtering, Access Permissions, Caching.

If your project needs any of those things, feel free to reuse what you see, but take note that our implementation is in every case completely decoupled from the tooling we are introducing here. Meaning - you could use the same patterns in any JavaScript based GraphQL setup, also - that you could use any pattern that you find (or come up with) with our generator. 


### Working with pagination

Relevant files:
graphql-todo-lists/src/modules/Lists/graphql/queries/PagedListsQuery.ts
graphql-todo-lists/src/modules/Lists/graphql/queries/PagedListsQuery.spec.ts
graphql-todo-lists/src/helpers/Paginator.ts
graphql-todo-lists/src/helpers/Paginator.spec.ts

Pagination allows to narrow query results to a specific subset that satisfies pagination arguments passed in the query.

The implementation of pagination mechanism in this repo is based on Relay standard of pagination, which is described at https://relay.dev/graphql/connections.htm

There are four pagination arguments that can be passed to a query

```text
input PaginationInput {
    first: Int
    after: ID
    last: Int
    before: ID
}
```

1. `after`: a cursor (ID) of an item that is the left boundary of returned subset of items (if not passed then there is no left boundary)
2. `before`: a cursor (ID) of an item that is the right boundary of returned subset of items (if not passed then there is no right boundary)
3. `first`: a non-negative integer, should be passed either on its own or along with `after` argument; defines amount of items to be returned that are first items found
4. `last`: a non-negative integer, should be passed either on its own or along with `before` argument; defines amount of items to be returned that are last items found

More detailed description of pagination arguments can be found at https://relay.dev/graphql/connections.htm#sec-Arguments

Results returned by pagination query consist not only of items that would be expected to be the result of the query.
Each paginated query returns a `connection`, that stores result array of items as `edges` array, where `edge` is an object consisting of node (item itself) and cursor (usually ID of an item).
Additionally, `connection` also contains `pageInfo` which provides information about start/end cursors of returned edges and whether there are previous and next pages.

Example:

```text
type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: ID!
    endCursor: ID!
}

type ListEdge {
    cursor: ID!
    node: List!
}

type ListConnection {
    edges: [ListEdge]!
    pageInfo: PageInfo!
}
```

In short, `edges` contain data for which query was built, and `pageInfo` consists of information necessary to ensure that paginated query can be wired up to some sort of frontend solution.
More information on format of returned data can be found at https://relay.dev/graphql/connections.htm#sec-Connection-Types

### Working with filtering

Relevant files:
graphql-todo-lists/src/modules/Lists/common/filterLists.ts
graphql-todo-lists/src/modules/Lists/common/filterLists.spec.ts

Another mechanism that allows narrowing of result number is filtering, by returning only items that are satisfying predicates constructed based on query arguments.

Example:

```text
input ListFilterQueryInput {
    partialName: String
}

extend type Query {
    Lists(filter: ListFilterQueryInput): [List!]!
}
```

In example above, there is an extra `filter` argument added to the lists Query.
It consists of optional string field `partialName`, which can be used on the backend to construct a regular expression-based predicate,
that will filter out any List items that do not have `partialName` string as a part of their `name`.

It is important to note that GraphQL itself does not do filtering, so any filtering mechanism has to be implemented as a part of resolver/context/use case.

### Enforcing access permissions

A custom directive called `@authorized` has been added to the schema. It allows annotations on both the `FIELD_DEFINITION` and the `OBJECT` level. The `@authorized` directive also supports multiple roles to be passed as a part of a given directive.

In the example below, the `TodoItem` type will only be resolved if the user has either the `REGISTERED_USER` or `ADMIN` role. Given a user that has the `REGISTERED_USER` role, they will be able to resolve all of the `TodoItem` fields except the `list` field.

Example:

```graphql
type TodoItem @authorized(requires: [REGISTERED_USER, ADMIN]) { # OBJECT level directive
  id: ID!
  text: String
  checked: Boolean!
  list: List @authorized(requires: [ADMIN]) # FIELD_DEFINITION level directive
  listId: ID!
}
```

You can also specify to the `Query` and the `Mutation` GQL Types (yes, these are types in GQL), so one can annotate them as such:

```graphql
type Mutation {
  RemoveList(listId: ID!): String! @authorized(requires: [ADMIN]) # required a logged in admin 
  Login(username: String!, password: String!): Boolean # doesn't require any access control
  # ...other mutations
}
```

Roles which are required in the `@authorized` directive should be defined in the source `schema.graphql` file located at `./<federated-service>/src/graphql/` as an enum:

```graphql
enum Roles {
  ADMIN
  REGISTERED_USER
}
```

User role(s) are extracted from a JWT token sent with the request in the `jwt` cookie. See the `AuthDirective.ts` for the implementation of the directive, and the `AuthModule.ts` for unpacking the JWT. Each federated service which implements the  `@authorized` directive expects the JWT shape to be like this:

```json
{
  "roles": ["ADMIN"]
}
```
If the incoming request does not have JWT cookie then it will be considered a user with no roles.

For development, use `npm start` from the root of the project. This will also run the `auth-module` ExpressJS server which has three routes defined:

`http://localhost:4003/admin` - Sets a cookie header with the Admin role in the JWT. 

`http://localhost:4003/user` - Sets a cookie header with the REGISTERED_USER role in the JWT. 

`http://localhost:4003/logout` - Removes the JWT cookie from the browser. 
