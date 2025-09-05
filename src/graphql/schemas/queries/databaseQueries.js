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
  _id: MongoID!
  name: String!
  Tenant: MongoID!
  createdBy: MongoID!
  fields: [Field!]!
}


type Field {
  _id: MongoID!
  name: String!
  type: String!
  options: [String!]!
}




type Row {
  _id: MongoID!
  database: MongoID!
  Tenant: MongoID!
  values: [Value!]!
}

type Value {
  _id: MongoID!
  fieldId: MongoID!
  value: JSON
}



type Query {
  getFullDatabaseDetails(TenantId: MongoID!, databaseId: MongoID!,page: Int, limit: Int): DatabaseDetailsPayload!
}

`;
