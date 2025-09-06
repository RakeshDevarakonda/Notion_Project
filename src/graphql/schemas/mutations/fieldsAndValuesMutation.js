export const fieldsAndValuesMutation = `#graphql

scalar JSON
scalar MongoID



#-----updateValues mutation -----

input UpdateValuesPayloadInput {
  TenantId: MongoID!
  databaseId: MongoID!
  updates: [UpdateValueInput!]!
}

input UpdateValueInput {
  rowId: MongoID!
  valueId: MongoID!
  newValue: JSON!  
}

#-----updateValues payload-----

type UpdateValuesPayload {
  updatedRows: [UpdatedRow!]!
}

type UpdatedRow {
  rowId: MongoID!
  valueId: MongoID!
  fieldId: MongoID!
  value: JSON!
}



#-----createFieldAndValues mutation-----


input addFieldandValuesInput {
  TenantId: MongoID!
  databaseId: MongoID!
  fields: [FieldInput!]!
  values: [RowValuesInput!]
}

input FieldInput {
  name: String!
  type: String!
  options: [String]
}

input RowValuesInput {
  rowId: MongoID!
  values: [ValueInput!]!
}

input ValueInput {
  value: JSON!
}


#-----createFieldAndValues payload-----

type CreateFieldAndValuesPayload {
  newFields: [Field!]!
  updatedRowIds: [MongoID!]!
}

type Field {
  _id: MongoID!
  name: String!
  type: String!
  options: [String]
}


#-----deleteFields mutation-----


input DeleteFieldsInput {
  TenantId: MongoID!
  databaseId: MongoID!
  fieldIds: [MongoID!]!
}

#-----deleteFields payload-----


type DeleteFieldsPayload {
  success: Boolean!
  deletedFieldIds: [MongoID!]!
}


#--updateMutiplefileds mutation-----



input UpdateMultipleFieldsInput {
  TenantId: MongoID!
  databaseId: MongoID!
  updates: [UpdateFieldInput!]!
}


input UpdateFieldInput {
  fieldId: MongoID!
  values: UpdateFieldValuesInput!
}

input UpdateFieldValuesInput {
  name: String!
  type: String!
  options: [String]
}

#--updateMutiplefileds payload-----

type UpdateMultipleFieldsPayload {
  updatedFields: [Field!]!

  #field already defined at top
}


type Mutation {
  editMultipleValueById(input: UpdateValuesPayloadInput!): UpdateValuesPayload!
  addFieldandValues(input: addFieldandValuesInput!): CreateFieldAndValuesPayload!
  editMultipleFields(input: UpdateMultipleFieldsInput!): UpdateMultipleFieldsPayload!
  deleteFields(input: DeleteFieldsInput!): DeleteFieldsPayload!


}


`;
