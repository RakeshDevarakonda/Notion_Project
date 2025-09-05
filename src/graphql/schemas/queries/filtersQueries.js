export const filterQueries=`#graphql


input TextFilter {
  equals: String
  notEquals: String
  contains: String
  notContains: String
  startsWith: String
  endsWith: String
}

input NumberFilter {
  equals: Float
  notEquals: Float
  gt: Float
  gte: Float
  lt: Float
  lte: Float
  between: [Float] # [min, max]
}

input DateFilter {
  equals: String
  notEquals: String
  before: String
  after: String
  between: [String] # [startDate, endDate]
  today: Boolean
  yesterday: Boolean
  tomorrow: Boolean
  thisWeek: Boolean
  lastWeek: Boolean
  nextWeek: Boolean
  thisMonth: Boolean
  lastMonth: Boolean
  nextMonth: Boolean
}

input BooleanFilter {
  equals: Boolean
}

input SelectFilter {
  equals: String
  notEquals: String
}

input MultiSelectFilter {
  contains: [String]
  containsAll: [String]
  notContains: [String]
}

input RelationFilter {
  equals: MongoID
  notEquals: MongoID
  contains: [MongoID]
}

input FieldFilterInput {
  fieldId: MongoID
  text: TextFilter
  number: NumberFilter
  date: DateFilter
  boolean: BooleanFilter
  select: SelectFilter
  multiSelect: MultiSelectFilter
  relation: RelationFilter
}

input RowFilterInput {
  databaseId: MongoID!
  TenantId: MongoID!
  filters: [FieldFilterInput!]!
  page: Int
  limit: Int
}

type RowPagination {
  page: Int!
  limit: Int!
  totalRows: Int!
  rows: [Row!]!
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
  getFilteredRows(input: RowFilterInput!): RowPagination!
}



`