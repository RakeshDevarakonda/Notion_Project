export const fieldsAndValuesMutation = `#graphql

input CreateFieldAndValuesInput {
  TenantId: ID
  databaseId: ID
  fields: [FieldInput]
  values: [ValueInput]  
}


input FieldInput {
  name: String
  type: String       
  options: [String] 
  relation: ID     
}


input ValueInput {
  rowId: ID
  value: JSON       
}


type CreateFieldAndValuesPayload {
  newFields: [Field]
  updatedRowIds: [ID]
}


type Field {
  _id: ID
  name: String
  type: String
  options: [String]
  relation: ID
}




type Value {
  _id: ID
  fieldId: ID
  value: JSON
}








input UpdateMultipleFieldsInput {
  TenantId: ID!
  databaseId: ID!
  updates: [UpdateFieldInput!]!
}




input UpdateFieldInput {
  fieldId: ID!
  values: UpdateFieldValuesInput!
}

input UpdateFieldValuesInput {
  name: String
  type: String
  options: [String]
  relation: ID
}







input UpdateValuesPayloadInput {
  TenantId: ID!
  databaseId: ID!
  updates: [UpdateValueInput!]!
}


input UpdateValueInput {
  rowId: ID!
  valueId: ID!
  newValue: JSON!  
}

type UpdateValuesPayload {

  updatedRows: [UpdatedRow!]!
}


type UpdatedRow {
  _id: ID!
  database: ID!
  values: [Value!]!
}

type Value {
  _id: ID!
  fieldId: ID!
  value: JSON
}




type Mutation {
  updateValues(input: UpdateValuesPayloadInput!): UpdateValuesPayload!
  createFieldAndValues(input: CreateFieldAndValuesInput!): CreateFieldAndValuesPayload

  updateMultipleFields(input: UpdateMultipleFieldsInput!): UpdateMultipleFieldsPayload!


}


`;
