import { Database, Row } from "../../../models/Database.js";
import { throwUserInputError } from "../../../utils/throwError.js";
import { getDefaultValue, processFieldValue } from "../../../utils/validate.js";

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

  const updatedRowIds = [];

  if (Array.isArray(values) && values.length > 0) {
    const bulkOps = [];

    for (const rowInput of values) {
      const { rowId, values: rowValues } = rowInput;

      const row = await Row.findOne({ _id: rowId, database: databaseId });
      if (!row) throwUserInputError(`Row ${rowId} not found in this database`);

      const updates = [];

      for (let i = 0; i < rowValues.length; i++) {
        const field = newFields[i];
        let val = rowValues[i].value;

        val = await processFieldValue(
          field,
          val,
          database.Tenant.toString(),
          database.createdBy.toString()
        );

        updates.push({ fieldId: field._id, value: val });
      }

      const providedFieldIds = updates.map((u) => u.fieldId.toString());
      const missingFields = newFields.filter(
        (f) => !providedFieldIds.includes(f._id.toString())
      );

      for (const f of missingFields) {
        updates.push({ fieldId: f._id, value: getDefaultValue(f.type) });
      }

      bulkOps.push({
        updateOne: {
          filter: { _id: rowId },
          update: { $push: { values: { $each: updates } } },
          upsert: true,
        },
      });

      updatedRowIds.push(rowId);
    }

    if (bulkOps.length > 0) await Row.bulkWrite(bulkOps);
  }

  const allRows = await Row.find({ database: databaseId });
  const remainingRows = allRows.filter(
    (r) => !updatedRowIds.includes(r._id.toString())
  );

  if (remainingRows.length > 0) {
    const bulkOps = [];
    remainingRows.forEach((row) => {
      const updates = newFields.map((f) => ({
        fieldId: f._id,
        value: getDefaultValue(f.type),
      }));

      bulkOps.push({
        updateOne: {
          filter: { _id: row._id },
          update: { $push: { values: { $each: updates } } },
        },
      });
    });

    if (bulkOps.length > 0) await Row.bulkWrite(bulkOps);
  }

  await database.save();

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
    if (!row) throwUserInputError(`Row ${rowId} not found in this database`);

    const valueObj = row.values.id(valueId);
    if (!valueObj)
      throwUserInputError(`Value ${valueId} not found in row ${rowId}`);

    const field = database.fields.id(valueObj.fieldId);
    if (!field)
      throwUserInputError(
        `Field ${valueObj.fieldId} not found in database ${databaseId}`
      );

    if (row.Tenant.toString() !== database.Tenant.toString()) {
      throwUserInputError(
        `Row ${rowId} does not belong to the same tenant as the database`
      );
    }

    let val = await processFieldValue(
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
    if (!field)
      throwUserInputError(`Field ${fieldId} not found in this database`);

    const oldType = field.type;
    const newType = values.type;

    field.name = values.name;
    field.type = newType;
    field.options = values.options || [];

    if (oldType !== newType) {
      const rows = await Row.find({ database: databaseId });

      for (const row of rows) {
        let changed = false;

        for (const v of row.values) {
          if (v.fieldId.toString() === fieldId) {
            changed = true;

            v.value = getDefaultValue(newType);
          }
        }

        if (changed) await row.save();
      }
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
