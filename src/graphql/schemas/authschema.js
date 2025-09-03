export const typeDefs = `#graphql
  type Tenant {
    id: ID!
    name: String!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    tenant: Tenant
  }

  type AuthPayload {
    user: User!
    token: String!
  }

  type Query {
        mydetails(id: ID!): User
  }

  type Mutation {
    signup(
      name: String!
      email: String!
      password: String!
    ): AuthPayload

    login(
      email: String!
      password: String!
    ): AuthPayload
  }
`;
