import mongoose from "mongoose";
import { Database, Row } from "../../../models/Database.js";
import Tenant from "../../../models/Tenant.js";
import { throwUserInputError } from "../../../utils/throwError.js";

const getDefaultValue = (field) => {
  switch (field.type) {
    case "number":
      return 0;
    case "boolean":
      return false;
    case "multi-select":
      return [];
    case "relation":
      return null;
    case "date":
      return null;
    default:
      return "";
  }
};

const normalizeValue = (field, value) => {
  switch (field.type) {
    case "number":
      return Number(value);
    case "boolean":
      return Boolean(value);
    case "multi-select":
      return Array.isArray(value) ? value : [value];
    case "select":
      return field.options.includes(value) ? value : "";
    case "date":
      if (typeof value === "string") {
        const isValid = /^\d{4}-\d{2}-\d{2}$/.test(value);
        const dateObj = new Date(value);
        const [y, m, d] = value.split("-").map(Number);
        if (
          !isValid ||
          dateObj.getFullYear() !== y ||
          dateObj.getMonth() + 1 !== m ||
          dateObj.getDate() !== d
        ) {
          throwUserInputError(
            `Invalid date for field "${field.name}". Use YYYY-MM-DD`
          );
        }
        return dateObj;
      }
      return value;
    case "relation":
      return value ? new mongoose.Types.ObjectId(value) : null;
    default:
      return value;
  }
};

export const createFieldandValues = async (input, contextUser) => {
  const { TenantId, databaseId, fields, values } = input;

  const database = await Database.findById(databaseId);
  if (!database) throwUserInputError("Database not found");

  // Create new fields
  const newFields = fields.map((field) => {
    const newField = database.fields.create({
      name: field.name,
      type: field.type || "text",
      options: field.options || [],
    });
    database.fields.push(newField);
    return newField;
  });
  await database.save();

  const updatedRowIds = [];

  // Handle provided row values
  if (Array.isArray(values) && values.length > 0) {
    const bulkOps = [];

    values.forEach((valObj, index) => {
      const field = newFields[index];
      let val = valObj.value ?? getDefaultValue(field);

      // Type-specific conversion
      val = normalizeValue(field, val);

      bulkOps.push({
        updateOne: {
          filter: { _id: valObj.rowId },
          update: {
            $push: { values: { fieldId: field._id, value: val } },
          },
          upsert: true,
        },
      });
      updatedRowIds.push(valObj.rowId);
    });

    if (bulkOps.length > 0) await Row.bulkWrite(bulkOps);
  }

  // Fill defaults for rows not updated
  const allRows = await Row.find({ database: databaseId });
  const remainingRows = allRows.filter(
    (r) => !updatedRowIds.includes(r._id.toString())
  );

  if (remainingRows.length > 0) {
    const bulkOps = [];
    remainingRows.forEach((row) => {
      newFields.forEach((field) => {
        const defaultVal = getDefaultValue(field);
        bulkOps.push({
          updateOne: {
            filter: { _id: row._id },
            update: {
              $push: { values: { fieldId: field._id, value: defaultVal } },
            },
          },
        });
      });
    });
    if (bulkOps.length > 0) await Row.bulkWrite(bulkOps);
  }

  return { newFields, updatedRowIds };
};

export const editValueById = async (input, contextUser) => {
  const { TenantId, databaseId, updates } = input;

  const tenant = await Tenant.findById(TenantId);
  if (!tenant) throwUserInputError("Tenant not found");

  const database = await Database.findById(databaseId);
  if (!database) throwUserInputError("Database not found");

  const updatedRows = [];
  const bulkOps = [];

  for (const upd of updates) {
    const { rowId, valueId, newValue } = upd;

    const row = await Row.findOne({ _id: rowId, database: databaseId });
    if (!row) throwUserInputError(`Row ${rowId} not found`);

    const valueObj = row.values.id(valueId);
    if (!valueObj)
      throwUserInputError(`Value ${valueId} not found in row ${rowId}`);

    const field = database.fields.id(valueObj.fieldId);
    if (!field) throwUserInputError(`Field ${valueObj.fieldId} not found`);

    let val = normalizeValue(field, newValue);

    bulkOps.push({
      updateOne: {
        filter: { _id: rowId, "values._id": valueId },
        update: { $set: { "values.$.value": val } },
      },
    });

    updatedRows.push({ rowId, valueId, fieldId: field._id, value: val });
  }

  if (bulkOps.length > 0) await Row.bulkWrite(bulkOps);

  return { updatedRows };
};

export const updateMultipleFields = async (input, contextUser) => {
  const { TenantId, databaseId, updates } = input;

  const tenantDetails = await Tenant.findById(TenantId);
  if (!tenantDetails) throwUserInputError("Tenant not found");

  const database = await Database.findById(databaseId);
  if (!database) throwUserInputError("Database not found");

  const sameCheck = await Database.findOne({
    _id: databaseId,
    tenantId: TenantId,
  });

  if (!sameCheck) {
    throwUserInputError("Database not found for this tenant");
  }

  const updatedFields = [];

  for (const upd of updates) {
    const { fieldId, values } = upd;

    if (!fieldId) throwUserInputError("FieldId is required for each update");
    if (!values || (values.name === undefined && values.type === undefined))
      throwUserInputError("please provide name or type");

    const field = database.fields.id(fieldId);
    if (!field) throwUserInputError(`Field ${fieldId} not found`);

    const oldType = field.type;
    const newType = values.type;

    if (values.name !== undefined) field.name = values.name;
    if (values.type !== undefined) field.type = values.type;
    if (values.options !== undefined) field.options = values.options;
    if (values.relation !== undefined) field.relation = values.relation;

    // 🔑 If field type changed, normalize values in Row collection
    const rows = await Row.find({ database: databaseId });

    for (const row of rows) {
      let changed = false;

      row.values.forEach((v) => {
        if (v.fieldId.toString() === fieldId) {
          changed = true;

          switch (newType) {
            case "number":
              v.value = Number(v.value) || 0;
              break;
            case "boolean":
              v.value = Boolean(v.value);
              break;
            case "multi-select":
              v.value = Array.isArray(v.value) ? v.value : [v.value];
              break;
            case "select":
              v.value =
                field.options.includes(v.value) && typeof v.value === "string"
                  ? v.value
                  : "";
              break;
            default:
              v.value = v.value ? String(v.value) : "";
          }
        }
      });

      if (changed) await row.save();
    }

    updatedFields.push({
      _id: field._id,
      name: field.name,
      type: field.type,
      options: field.options,
    });
  }

  await database.save();

  return { updatedFields };
};

export const deleteFields = async (input, contextUser) => {
  const { TenantId, databaseId, fieldIds } = input;


  const tenantDetails = await Tenant.findById(TenantId);
  if (!tenantDetails) throwUserInputError("Tenant not found");


  const database = await Database.findById(databaseId);
  if (!database) throwUserInputError("Database not found");

  const sameCheck = await Database.findOne({
    _id: databaseId,
    tenantId: TenantId,
  });

  if (!sameCheck) {
    throwUserInputError("Database not found for this tenant");
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
