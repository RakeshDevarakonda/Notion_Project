import { Database } from "../../../models/Database.js";
import Tenant from "../../../models/Tenant.js";
import { throwUserInputError } from "../../../utils/throwError.js";
import { graphQlvalidateObjectId } from "../../../utils/validate.js";




export const createFieldandValues = async (input, contextUser) => {
  const { TenantId, databaseId, fields, values } = input;

  if (!TenantId) throwUserInputError("TenantId is required");
  if (!databaseId) throwUserInputError("Database ID is required");

  graphQlvalidateObjectId(TenantId, "Tenant ID");

  const tenantDetails = await Tenant.findOne({ _id: TenantId });

  if (!tenantDetails) throwUserInputError("Tenant not found");

  const member = tenantDetails.members.find(
    (m) =>
      m.tenantUserId.toString() === contextUser._id.toString() && m.isActive
  );

  if (!member)
    throwUserInputError(
      "User is not a member of this tenant or might be inactive"
    );

  if (!fields || fields.length === 0) throwUserInputError("Field are required");

  const database = await Database.findById(databaseId);
  if (!database) throwUserInputError("Database not found");

  const newFields = [];

  for (const field of fields) {
    const newField = database.fields.create({
      name: field.name || "",
      type: field.type || "text",
      options: field.options || [],
      relation: field.relation || null,
    });

    database.fields.push(newField);
    newFields.push(newField);
  }

  await database.save();

  let updatedRowIds = [];

  if (Array.isArray(values) && values.length > 0) {
    const bulkOps = values.map(({ rowId, value }, i) => {
      const field = newFields[i];

      let val = value;
      if (field.type === "multi-select" && !Array.isArray(val)) val = [val];
      if (field.type === "number") val = Number(val);

      updatedRowIds.push(rowId);

      return {
        updateOne: {
          filter: { _id: rowId },
          update: {
            $set: {
              database: database._id,
              Tenant: TenantId,
            },
            $push: {
              values: {
                fieldId: field._id,
                value: val,
              },
            },
          },
        },
      };
    });

    if (bulkOps.length > 0) await Row.bulkWrite(bulkOps);
  }
  return { newFields, updatedRowIds };
};


export const editValueById = async (input, contextUser) => {
  const { TenantId, databaseId, updates } = input;

  if (!TenantId) throwUserInputError("TenantId is required");
  if (!databaseId) throwUserInputError("DatabaseId is required");
  if (!Array.isArray(updates) || updates.length === 0)
    throwUserInputError("Updates array is required");

  graphQlvalidateObjectId(TenantId, "Tenant ID");
  graphQlvalidateObjectId(databaseId, "Database ID");

  const tenantDetails = await Tenant.findById(TenantId);
  if (!tenantDetails) throwUserInputError("Tenant not found");

  const member = tenantDetails.members.find(
    (m) =>
      m.tenantUserId.toString() === contextUser._id.toString() && m.isActive
  );
  if (!member)
    throwUserInputError(
      "User is not a member of this tenant or might be inactive"
    );

  const database = await Database.findById(databaseId);
  if (!database) throwUserInputError("Database not found");

  const updatedRows = [];

  for (const upd of updates) {
    const { rowId, valueId, newValue } = upd;

    graphQlvalidateObjectId(rowId, "Row ID");
    graphQlvalidateObjectId(valueId, "Value ID");

    const row = await Row.findOne({ _id: rowId, database: databaseId });
    if (!row) throwUserInputError(`Row ${rowId} not found`);

    const valueObj = row.values.id(valueId);
    if (!valueObj)
      throwUserInputError(`Value ${valueId} not found in row ${rowId}`);

    let val = newValue;
    const field = database.fields.id(valueObj.fieldId);

    if (!field) throwUserInputError(`Field ${valueObj.fieldId} not found`);

    if (field.type === "multi-select" && !Array.isArray(val)) val = [val];
    if (field.type === "number") val = Number(val);

    valueObj.value = val;
    await row.save();

    updatedRows.push({
      _id: row._id,
      database: row.database,
      values: [
        {
          _id: valueObj._id,
          fieldId: valueObj.fieldId,
          value: valueObj.value,
        },
      ],
    });
  }

  return {
    updatedRows,
  };
};



export const updateMultipleFields = async (input, contextUser) => {
  const { TenantId, databaseId, updates } = input;

  if (!TenantId) throwUserInputError("TenantId is required");
  if (!databaseId) throwUserInputError("DatabaseId is required");
  if (!Array.isArray(updates) || updates.length === 0)
    throwUserInputError("Updates array is required");

  graphQlvalidateObjectId(TenantId, "Tenant ID");
  graphQlvalidateObjectId(databaseId, "Database ID");

  const tenantDetails = await Tenant.findById(TenantId);
  if (!tenantDetails) throwUserInputError("Tenant not found");

  const member = tenantDetails.members.find(
    (m) =>
      m.tenantUserId.toString() === contextUser._id.toString() && m.isActive
  );
  if (!member) throwUserInputError("You are not a member of this tenant");

  const database = await Database.findById(databaseId);
  if (!database) throwUserInputError("Database not found");

  const updatedFields = [];

  for (const upd of updates) {
    const { fieldId, values } = upd;

    if (!fieldId) throwUserInputError("FieldId is required for each update");
    if (!values || (values.name === undefined && values.type === undefined))
      throwUserInputError("please provide name or type");

    graphQlvalidateObjectId(fieldId, "Field ID");

    const field = database.fields.id(fieldId);
    if (!field) throwUserInputError(`Field ${fieldId} not found`);

    if (values.name !== undefined) field.name = values.name;
    if (values.type !== undefined) field.type = values.type;
    if (values.options !== undefined) field.options = values.options;
    if (values.relation !== undefined) field.relation = values.relation;

    if (values.type === "multi-select") {
      const rows = await Row.find({ database: databaseId });
      for (const row of rows) {
        row.values.forEach((v) => {
          if (v.fieldId.toString() === fieldId) {
            if (!Array.isArray(v.value)) v.value = [v.value];
          }
        });
        await row.save();
      }
    }
    updatedFields.push({
      _id: field._id,
      name: field.name,
      type: field.type,
      options: field.options,
      relation: field.relation,
    });
  }

  await database.save();

  return { updatedFields };
};



export const deleteFields = async (input, contextUser) => {
  const { TenantId, databaseId, fieldIds } = input;

  if (!TenantId) throwUserInputError("TenantId is required");
  if (!databaseId) throwUserInputError("DatabaseId is required");
  if (!Array.isArray(fieldIds) || fieldIds.length === 0)
    throwUserInputError("fieldIds array is required");

  graphQlvalidateObjectId(TenantId, "Tenant ID");
  graphQlvalidateObjectId(databaseId, "Database ID");
  fieldIds.forEach((id) => graphQlvalidateObjectId(id, "Field ID"));

  const tenantDetails = await Tenant.findById(TenantId);
  if (!tenantDetails) throwUserInputError("Tenant not found");

  const member = tenantDetails.members.find(
    (m) =>
      m.tenantUserId.toString() === contextUser._id.toString() && m.isActive
  );
  if (!member)
    throwUserInputError(
      "User is not a member of this tenant or might be inactive"
    );

  const database = await Database.findById(databaseId);
  if (!database) throwUserInputError("Database not found");

  const existingFieldIds = database.fields.map((field) => field._id.toString());

  const invalidFieldIds = fieldIds.filter(
    (id) => !existingFieldIds.includes(id)
  );

  if (invalidFieldIds.length > 0) {
    throwUserInputError(`Field ID's Not Found: ${invalidFieldIds.join(", ")}`);
  }

  database.fields = database.fields.filter(
    (field) => !fieldIds.includes(field._id.toString())
  );
  await database.save();

  await Row.updateMany(
    { database: databaseId },
    { $pull: { values: { fieldId: { $in: fieldIds } } } }
  );

  return {
    success: true,
    deletedFieldIds: fieldIds,
  };
};