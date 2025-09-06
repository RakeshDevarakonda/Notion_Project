import { Database, Row } from "../../../models/Database.js";
import { throwUserInputError } from "../../../utils/throwError.js";
import { getDefaultValue, processFieldValue } from "../../../utils/validate.js";

export const createNewRows = async (input) => {
  const { TenantId, databaseId, rows } = input;

  const database = await Database.findOne({
    _id: databaseId,
    Tenant: TenantId,
  });

  if (!database) throwUserInputError("Database not found");

  const rowsToInsert = [];

  for (let r = 0; r < rows.length; r++) {
    const rowInput = rows[r];
    const rowValues = [];

    for (let i = 0; i < database.fields.length; i++) {
      const field = database.fields[i];
      if (!field)
        throwUserInputError(`Field not found at index ${i} for row ${r + 1}`);

      let value = rowInput[i]?.value;
      if (value === undefined || value === null) {
        value = getDefaultValue(field.type);
      }

      value = await processFieldValue(
        field,
        value,
        database.Tenant.toString(),
        database.createdBy.toString()
      );

      rowValues.push({ fieldId: field._id, value });
    }

    rowsToInsert.push({
      Tenant: TenantId,
      database: database._id,
      values: rowValues,
    });
  }

  const newRows = await Row.insertMany(rowsToInsert);
  const payload = newRows.map((row) => ({
    rowId: row._id,
    values: row.values.map((v) => ({
      valueId: v._id,
      value: v.value,
      fieldId: v.fieldId,
    })),
  }));

  return payload;
};

export const deleteRowsByIds = async (input) => {
  const { databaseId, rowIds } = input;

  const existingRows = await Row.find({
    _id: { $in: rowIds },
    database: databaseId,
  });

  if (existingRows.length !== rowIds.length) {
    const existingIds = existingRows.map((r) => r._id.toString());
    const invalidRowIds = rowIds.filter((id) => !existingIds.includes(id));
    throwUserInputError(`Rows Not Found in db or invalid rowid: ${invalidRowIds.join(", ")}`);
  }

  await Row.deleteMany({
    _id: { $in: rowIds },
    database: databaseId,
  });

  return { success: true, deletedRowIds: rowIds };
};
