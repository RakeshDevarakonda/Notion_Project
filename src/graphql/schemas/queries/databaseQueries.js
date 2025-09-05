export const databaseQueries = `#graphql

scalar JSON




type DatabaseDetailsPayload {
  database: Database!
  rows: [Row]!
  page: Int!
  limit: Int!
  totalRows: Int!
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
  getDatabaseData(TenantId: ID!, databaseId: ID!,page: Int, limit: Int): DatabaseDetailsPayload!
}

`;
