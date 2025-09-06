export const databaseMutation = `#graphql

scalar JSON 

scalar MongoID

#---- createdbwithrows mutation------

input CreateDatabaseInput {
  name: String!
  fields: [FieldInput!]
  rows: [RowInput!]
  TenantId: MongoID!
}


input FieldInput {
  name: String!
  type: String!
  options: [String]
}


input RowInput {
  values: [ValueInput!]!
}


input ValueInput {
  value: JSON!
}

#---- createdbwithrows payload------




type CreateDatabasePayload {
  database: Database!
  rows: [Row!]
}


type Database {
  _id: MongoID!
  Tenant: MongoID!
  name: String!
  fields: [Field!]
}



type Field {
  _id: MongoID!
  name: String!
  type: String!
  options: [String]
}



type Row {
  _id: MongoID!
  database: MongoID!
  Tenant: MongoID!
  values: [Value!]!
}



#---- deleteDatabases mutaiton------

input DeleteDatabasesInput {
  TenantId: MongoID!
  databaseIds: [MongoID!]!
}


#---- deleteDatabases payload------


type DeleteDatabasesPayload {
  success: Boolean!
  deletedDatabaseIds: [MongoID!]!
}


#---- updateDatabase mutation------

input updateDatabaseInput {
  TenantId: MongoID!
  databaseId: MongoID!
  newName: String!
}

#---- updateDatabase payload------


type updateDatabasePayload {
  success: Boolean!
  database: Database!

  # already Database defined at top
}








type Mutation {
  createDatabase(input: CreateDatabaseInput): CreateDatabasePayload!
  deleteDatabases(input: DeleteDatabasesInput!): DeleteDatabasesPayload!
  updateDatabaseName(input: updateDatabaseInput!): updateDatabasePayload!

}
`;
