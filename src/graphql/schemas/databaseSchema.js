export const createDatabaseSchema = `#graphql

input DatabaseWithRowsInput {
  tenantId: ID!
  name: String!
  rows: [RowInput!]
}

input RowInput {
  rowNumber: Int!
  fields: [FieldValueInput!]!
}

input FieldValueInput {
  fieldName: String!
  fieldType: String!
  value: String
}


type Database {
  _id: ID!
  tenantId: ID!
  name: String!
  rows: [Row!]
  createdAt: String
  updatedAt: String
}

type Row {
  rowNumber: Int!
  data: [FieldValue!]!
}



type FieldValue {
  fieldName: String!
  fieldType: String!
  value: String
}





type Mutation {
  createDatabaseWithRows(input: DatabaseWithRowsInput!): Database!
}



 type User {
    name: String!
    email: String!
  }

  type Query {
    mydetails: User
  }
`;
