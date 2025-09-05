export const fieldAndValueQueries = `#graphql
scalar JSON


type FieldPayload {
  page: Int
  limit: Int
  totalValuesCount: Int
  sort:Int
  field: Field
  values: [Value]


}

type Value {
  rowId: ID
  valueId: ID
  value: JSON
}

type Field {
  _id: ID
  name: String
  type: String
  options: [String]
}


input GetValuesByFieldInput {
  TenantId: ID
  databaseId: ID
  fieldId: ID
  page: Int
  limit: Int
  sort:Int
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


type SearchResponse {
  count: Int!
  searchByValueName:String
  searchByFieldName:String
  results: [SearchResult!]!
}


type SearchResult {
  rowId: ID!
  value: String
  field: Field
}




type Query {
  getValuesByField(input: GetValuesByFieldInput): FieldPayload
  keywordSearch( TenantId: ID! databaseId: ID! searchByValueName: String, searchByFieldName: String): SearchResponse!
}

`;
