export const databaseQueries = `#graphql

scalar JSON




type DatabaseDetailsPayload {
  database: Database!
  rows: [Row]!
}

type Database {
  _id: ID!
  name: String!
  Tenant: ID!
  createdBy: ID!
  fields: [Field]
}


type Field {
  _id: ID!
  name: String
  type: String
  options: [String]
  relation: ID
}




type Row {
  _id: ID!
  database: ID!
  Tenant: ID!
  values: [Value]
}

type Value {
  _id: ID!
  fieldId: ID!
  value: JSON
}



type Query {
  getDatabaseData(TenantId: ID!, databaseId: ID!): DatabaseDetailsPayload!
}

`;
