import { Database, Row } from "../../../models/Database.js";
import { throwUserInputError } from "../../../utils/throwError.js";
import { processFieldValue } from "../../../utils/validate.js";

const getDefaultValueForFieldType = (field) => {
  switch (field.type) {
    case "number":
    case "boolean":
      return null; // empty for number/boolean
    case "multi-select":
      return []; // empty array for multi-select
    case "select":
    case "text":
    default:
      return ""; // empty string for select or text
  }
};

export const addFieldandValues = async (input) => {
  const { databaseId, fields, values } = input;

  const database = await Database.findById(databaseId);

  const newFields = fields.map((field) => {
    const newField = database.fields.create({
      name: field.name,
      type: field.type,
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
      let val = valObj.value;

      if (val === undefined || val === null) {
        throwUserInputError("Value canot be null or undefined");
      }
      val = processFieldValue(
        field,
        val,
        database.Tenant.toString(),
        database.createdBy.toString()
      );

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
        const defaultVal = getDefaultValueForFieldType(field);
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

export const editValueById = async (input) => {
  const { databaseId, updates } = input;

  const database = await Database.findById(databaseId);

  const updatedRows = [];
  const bulkOps = [];

  for (const upd of updates) {
    const { rowId, valueId, newValue } = upd;

    const row = await Row.findOne({ _id: rowId, database: databaseId });
    if (!row) throwUserInputError(`Row ${rowId} not found`);

    const field = database.fields.id(valueObj.fieldId);
    if (!field) throwUserInputError(`Field ${valueObj.fieldId} not found`);

    let val = processFieldValue(
      field,
      newValue,
      database.Tenant.toString(),
      database.createdBy.toString()
    );

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

export const updateMultipleFields = async (input) => {
  const { databaseId, updates } = input;

  const database = await Database.findById(databaseId);

  const updatedFields = [];

  for (const upd of updates) {
    const { fieldId, values } = upd;

    const field = database.fields.id(fieldId);
    if (!field) throwUserInputError(`Field ${fieldId} not found`);

    const oldType = field.type;
    const newType = values.type;

    if (oldType === newType) {
      return;
    }

    field.name = values.name;
    field.type = values.type;
    if (options || options !== null || options !== undefined) {
      field.options = values.options;
    }

    // 🔑 If field type changed, normalize values in Row collection
    const rows = await Row.find({ database: databaseId });

    for (const row of rows) {
      let changed = false;

      row.values.forEach((v) => {
        if (v.fieldId.toString() === fieldId) {
          changed = true;

          switch (newType) {
            case "number":
            case "boolean":
              v.value = null;
              break;
            case "multi-select":
              v.value = [];
              break;
            case "select":
              v.value = "";
              break;
            default:
              v.value = "";
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

export const deleteFields = async (input) => {
  const { databaseId, fieldIds } = input;

  const database = await Database.findById(databaseId);

  const existingFieldIds = database.fields.map((f) => f._id.toString());
  const invalidFieldIds = fieldIds.filter(
    (id) => !existingFieldIds.includes(id)
  );

  if (invalidFieldIds.length > 0) {
    throwUserInputError(
      `These field IDs do not exist in the database: ${invalidFieldIds.join(
        ", "
      )}`
    );
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
