export const rowQueries = `#graphql

type RowPayload {

  row: Row!

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

  getRowById(TenantId: ID!, databaseId: ID!, rowId: ID!): RowPayload!

}

`;
