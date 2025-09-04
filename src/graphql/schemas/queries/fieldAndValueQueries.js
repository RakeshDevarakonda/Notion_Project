export const fieldAndValueQueries = `#graphql
scalar JSON


type FieldPayload {
  field: Field
  values: [Value]
  page: Int
  limit: Int
  totalValuesCount: Int

}

type Value {
  rowId: ID
  valueid: ID
  value: JSON
}

type Field {
  _id: ID
  name: String
  type: String
  options: [String]
  relation: ID
}


input GetValuesByFieldInput {
  TenantId: ID
  databaseId: ID
  fieldId: ID
  page: Int
  limit: Int
}

type FieldValuePayload {
  values: [FieldValue]
  page: Int
  limit: Int
  totalValuesCount: Int
}


type FieldValue {
  rowId: ID
  valueId: ID
  value: JSON
}


type Query {
  getValuesByField(input: GetValuesByFieldInput): FieldPayload

}

`;
