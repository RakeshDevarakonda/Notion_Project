import { Database, Row } from "../../../models/Database.js";
import { throwUserInputError } from "../../../utils/throwError.js";

export const createDBWithRowsAndValues = async (input, contextUser) => {
  const { name, TenantId, fields, rows } = input;

  const savedDatabase = new Database({
    name,
    fields: fields || [],
    Tenant: TenantId,
    createdBy: contextUser._id,
  });
  await savedDatabase.save();

  if (!fields || fields.length === 0)
    return { database: savedDatabase, rows: [] };
  if (!rows || rows.length === 0) return { database: savedDatabase, rows: [] };

  const rowDocs = [];

  for (const r of rows) {
    const valuesArray = [];

    for (let i = 0; i < savedDatabase.fields.length; i++) {
      const field = savedDatabase.fields[i];
      let value = r.values[i] !== undefined ? r.values[i].value : undefined;

      if (value === undefined || value === null) {
        switch (field.type) {
          case "number":
            value = 0;
            break;
          case "boolean":
            value = false;
            break;
          case "multi-select":
            value = [];
            break;
          case "select":
            value =
              field.options && field.options.length > 0 ? field.options[0] : "";
            break;
          case "relation":
            value = null;
            break;
          case "date":
            value = null;
            break;
          default:
            value = "";
        }
      }

      switch (field.type) {
        case "number":
          value = Number(value);
          break;
        case "boolean":
          value = Boolean(value);
          break;
        case "multi-select":
          if (!Array.isArray(value)) value = [value];
          break;
        case "select":
          if (!field.options.includes(value)) value = "";
          break;
        case "date":
          if (typeof value === "string") {
            const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(value);
            const dateObj = new Date(value);
            const [y, m, d] = value.split("-").map(Number);
            if (
              !isValidDate ||
              dateObj.getFullYear() !== y ||
              dateObj.getMonth() + 1 !== m ||
              dateObj.getDate() !== d
            ) {
              throwUserInputError(
                `Invalid date for field "${field.name}". Use YYYY-MM-DD`
              );
            }
            value = dateObj;
          }
          break;
        case "relation":
          if (value) {
            const relationDb = await Database.findById(value);
            if (!relationDb) throwUserInputError("Related database not found");

            if (
              relationDb.createdBy.toString() !==
                savedDatabase.createdBy.toString() ||
              relationDb.Tenant.toString() !== savedDatabase.Tenant.toString()
            ) {
              value = null;
            } else {
              value = new mongoose.Types.ObjectId(value);
            }
          }
          break;
      }

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
