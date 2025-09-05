import { Database, Row } from "../../../models/Database.js";
import { throwUserInputError } from "../../../utils/throwError.js";
import { processFieldValue } from "../../../utils/validate.js";

export const createDBWithRowsAndValues = async (input, contextUser) => {
  const { name, TenantId, fields, rows } = input;

  const savedDatabase = new Database({
    name,
    fields: fields || [],
    Tenant: TenantId,
    createdBy: contextUser._id,
  });
  await savedDatabase.save();

  if (!fields || fields.length === 0 || fields == undefined)
    return { database: savedDatabase, rows: [] };
  if (!rows || rows.length === 0 || rows == undefined)
    return { database: savedDatabase, rows: [] };

  const rowDocs = [];

  for (const r of rows) {
    const valuesArray = [];

    for (let i = 0; i < savedDatabase.fields.length; i++) {
      const field = savedDatabase.fields[i];
      let value = r.values[i].value;

      if (value === undefined || value === null) {
        throwUserInputError("Value canot be null or undefined");
      }

      processFieldValue(
        field,
        value,
        savedDatabase.Tenant.toString(),
        savedDatabase.createdBy.toString()
      );

      valuesArray.push({ fieldId: field._id, value });
    }

    rowDocs.push({
      Tenant: TenantId,
      database: savedDatabase._id,
      values: valuesArray,
    });
  }

  const savedRows = await Row.insertMany(rowDocs);

  return { database: savedDatabase, rows: savedRows };
};

export const deleteDatabasesByIds = async (input) => {
  const { databaseIds, TenantId } = input;

  const existingDatabases = await Database.find({
    _id: { $in: databaseIds },
  });

  if (existingDatabases.length !== databaseIds.length) {
    const existingIds = existingDatabases.map((db) => db._id.toString());
    const invalidDbIds = databaseIds.filter((id) => !existingIds.includes(id));
    throwUserInputError(`Database Not Found: ${invalidDbIds.join(", ")}`);
  }

  const unauthorizedDbIds = existingDatabases
    .filter((db) => db.Tenant.toString() !== TenantId)
    .map((db) => db._id.toString());

  if (unauthorizedDbIds.length > 0) {
    throwUserInputError(
      `Unauthorized: Databases do not belong to this tenant: ${unauthorizedDbIds.join(
        ", "
      )}`
    );
  }

  await Row.deleteMany({ database: { $in: databaseIds } });

  await Database.deleteMany({ _id: { $in: databaseIds } });

  return { success: true, deletedDatabaseIds: databaseIds };
};

export const updateDatabase = async (input) => {
  const { databaseId, newName } = input;

  const database = await Database.findById(databaseId);

  database.name = newName;
  await database.save();

  return { success: true, database };
};
