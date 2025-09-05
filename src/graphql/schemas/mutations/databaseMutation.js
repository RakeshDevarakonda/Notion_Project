export const databaseMutation = `#graphql


scalar JSON 


input FieldInput {
  name: String
  type: String
  options: [String]
}

input ValueInput {
  value: JSON
}

input RowInput {
  values: [ValueInput]
}

input CreateDatabaseInput {
  name: String!
  fields: [FieldInput!]!
  rows: [RowInput]
  TenantId: ID
}







type CreateDatabasePayload {
  database: Database

  rows: [Row]
}

type Database {
  _id: ID
  Tenant: ID
  name: String
  fields: [Field]
}



type Field {
  _id: ID
  name: String
  type: String
  options: [String]
}

type Row {
  _id: ID
  database: ID
  Tenant: ID!
  values: [Value]
}


type Value {
  _id: ID
  fieldId: ID
  value: JSON
}


input DeleteDatabasesInput {
  TenantId: ID!
  databaseIds: [ID!]!
}

type DeleteDatabasesPayload {
  success: Boolean!
  deletedDatabaseIds: [ID!]!
}








type Field {
  _id: ID!
  name: String
  type: String
  options: [String]
}

type UpdateMultipleFieldsPayload {
  updatedFields: [Field!]!
}


input updateDatabaseInput {
  TenantId: ID!
  databaseId: ID!
  newName: String!
}


type updateDatabasePayload {
  success: Boolean!
  database: Database!
}





type Mutation {
  createDatabaseWithRows(input: CreateDatabaseInput): CreateDatabasePayload
  deleteDatabases(input: DeleteDatabasesInput!): DeleteDatabasesPayload!
  updateDatabase(input: updateDatabaseInput!): updateDatabasePayload!

}
`;
