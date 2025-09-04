export const databaseMutation = `#graphql


scalar JSON 


input FieldInput {
  name: String
  type: String
  options: [String]
  relation: ID
}

input ValueInput {
  value: JSON
}

input RowInput {
  values: [ValueInput]
}

input CreateDatabaseInput {
  name: String!
  fields: [FieldInput]
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
  relation: ID
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



input DeleteFieldsInput {
  TenantId: ID!
  databaseId: ID!
  fieldIds: [ID!]!
}

type DeleteFieldsPayload {
  success: Boolean!
  deletedFieldIds: [ID!]!
}



type Field {
  _id: ID!
  name: String
  type: String
  options: [String]
  relation: ID
}

type UpdateMultipleFieldsPayload {
  updatedFields: [Field!]!
}





type Mutation {
  createDatabaseWithRows(input: CreateDatabaseInput): CreateDatabasePayload

  deleteFields(input: DeleteFieldsInput!): DeleteFieldsPayload!
  deleteDatabases(input: DeleteDatabasesInput!): DeleteDatabasesPayload!
}
`;
