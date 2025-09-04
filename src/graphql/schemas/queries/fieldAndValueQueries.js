export const fieldAndValueQueries = `#graphql

type FieldPayload {
  field: Field!
  values: [Value]
}

type Value {
  _id: ID!
  fieldId: ID!
  value: JSON
}

type Field {
  _id: ID!
  name: String
  type: String
  options: [String]
  relation: ID
}



type Query {

  getFieldValues(TenantId: ID!, databaseId: ID!, fieldID: ID!): FieldPayload!
}

`;
