export const rowQueries = `#graphql

type RowPayload {
  rows: [Row!]!   
}

type Row {
  _id: MongoID!
  database: MongoID!
  Tenant: MongoID!
  values: [Value!]
}

type Value {
  _id: MongoID!
  fieldId: MongoID!
  value: JSON!
}


type Query {
  getRowByIds(TenantId: MongoID!, databaseId: MongoID!, rowIds: [MongoID!]!): RowPayload!
}

`;
