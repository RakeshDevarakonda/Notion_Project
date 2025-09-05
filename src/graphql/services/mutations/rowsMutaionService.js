import { Database, Row } from "../../../models/Database.js";
import { throwUserInputError } from "../../../utils/throwError.js";
import { processFieldValue } from "../../../utils/validate.js";

export const createNewRows = async (input) => {
  const { TenantId, databaseId, rows } = input;

  const database = await Database.findOne({
    _id: databaseId,
    Tenant: TenantId,
  });


  const rowsToInsert = [];

  for (let r = 0; r < rows.length; r++) {
    const rowInput = rows[r];
    const rowValues = [];

    for (let i = 0; i < rowInput.length; i++) {
      const field = database.fields[i];
      if (!field)
        throwUserInputError(`Field not found at index ${i} for row ${r + 1}`);

      let value = rowInput[i]?.value;

      if (value === undefined || value === null) {
       throwUserInputError("Value can")
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

  // Insert all rows at once
  const newRows = await Row.insertMany(rowsToInsert);
  return newRows; // returns array of created rows
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
    throwUserInputError(`Rows Not Found: ${invalidRowIds.join(", ")}`);
  }

  await Row.deleteMany({
    _id: { $in: rowIds },
    database: databaseId,
  });

  return { success: true, deletedRowIds: rowIds };
};
