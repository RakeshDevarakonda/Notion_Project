export const rowsMutation = `#graphql
scalar JSON

input CreateRowInput {
  TenantId: ID!
  databaseId: ID!
  values: [ValueInput]!
}
input ValueInput {
  value: JSON!
}

type Row {
  _id: ID!
  database: ID!
  Tenant: ID!
  values: [Value!]!
}

type Value {
  _id: ID!
  fieldId: ID!
  value: JSON!
}








input DeleteRowsInput {
  TenantId: ID!
  databaseId: ID!
  rowIds: [ID!]!
}

type DeleteRowsPayload {
  success: Boolean!
  deletedRowIds: [ID!]!
}



type Mutation {
  deleteRows(input: DeleteRowsInput!): DeleteRowsPayload!
  createNewRow(input: CreateRowInput!): Row!
}




`;
