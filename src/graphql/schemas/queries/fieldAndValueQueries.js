export const fieldAndValueQueries = `#graphql
scalar JSON


#---getValuesByField mutation---

input GetValuesByFieldInput {
  TenantId: MongoID!
  databaseId: MongoID!
  fieldId: MongoID!
  page: Int
  limit: Int
  sort:Int
}


#---getValuesByField payload---



type FieldPayload {
  page: Int!
  limit: Int!
  totalValuesCount: Int!
  sort:Int!
  field: Field!
  values: [Value!]!
  }


  type Field {
  _id: MongoID!
  name: String!
  type: String!
  options: [String]
}

type Value {
  rowId: MongoID!
  valueId: MongoID!
  value: JSON!
}


#---keywordSearch payload---


type SearchResponse {
  count: Int!
  searchByValueName:String
  searchByFieldName:String
  results: [SearchResult!]!
}


type SearchResult {
  rowId: MongoID!
  value: String!
  field: Field!

  # Field provided at top
}



#-----relationdb payload---

type RelationDatabase {
  _id: MongoID!
    page: Int!
  limit: Int!
  totalRows: Int!
  name: String!
  Tenant: MongoID!
  createdBy: MongoID!
  fields: [Field!]
  rows: [Row!]

}

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



type Query {
  getValuesByField(input: GetValuesByFieldInput): FieldPayload!
  keywordSearch( TenantId: MongoID! databaseId: MongoID! searchByValueName: String, searchByFieldName: String): SearchResponse!
 getRelationDatabaseDetails(valueId: MongoID!, page: Int, limit: Int): RelationDatabase!


}

`;
