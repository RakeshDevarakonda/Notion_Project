export const authdefschema = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    invites: [Invite!]!
  }

  type Invite {
    tenantId: ID!
    email: String!
    status: String!
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
    ): AuthPayload!

    login(
      email: String!
      password: String!
    ): AuthPayload!
  }
`;
