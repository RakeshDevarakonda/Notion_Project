export const rowsMutation = `#graphql
scalar JSON



#----createnewrow mutation-------------------

input CreateRowInput {
  TenantId: MongoID!
  databaseId: MongoID!
  rows: [[ValueInput!]!]!
}
input ValueInput {
  value: JSON!
}

#----createnewrow payload-------------------


type Row {
  _id: MongoID!
  database: MongoID!
  Tenant: MongoID!
  values: [Value!]!
}

type Value {
  _id: MongoID!
  fieldId: MongoID!
  value: JSON!
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
  createNewRows(input: CreateRowInput!): Row!
  deleteRows(input: DeleteRowsInput!): DeleteRowsPayload!
}




`;
