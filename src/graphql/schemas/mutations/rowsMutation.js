export const rowsMutation = `#graphql
scalar JSON
scalar MongoID


#----createnewrow mutation-------------------

input CreateRowInput {
  TenantId: MongoID!
  databaseId: MongoID!
  rows: [[ValueInputData!]!]!
}
input ValueInputData {
  value: JSON!
}

#----createnewrow payload-------------------



type Value {
  valueId: MongoID!
  value: JSON!
  fieldId: MongoID!
}

type RowPayload {
  rowId: MongoID!
  values: [Value!]!
}


#----DeleteRows mutation-------------------



input DeleteRowsInput {
  TenantId: MongoID!
  databaseId: MongoID!
  rowIds: [MongoID!]!
}


#----DeleteRows payload-------------------

type DeleteRowsPayload {
  success: Boolean!
  deletedRowIds: [MongoID!]!
}



type Mutation {
  createNewRows(input: CreateRowInput!): [RowPayload!]!
  deleteRows(input: DeleteRowsInput!): DeleteRowsPayload!
}




`;
