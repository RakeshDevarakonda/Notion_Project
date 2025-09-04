import { Database, Row } from "../../../models/Database.js";
import Tenant from "../../../models/Tenant.js";
import { throwUserInputError } from "../../../utils/throwError.js";
import { graphQlvalidateObjectId } from "../../../utils/validate.js";

export const createDBWithRow = async (input, contextUser) => {
  const { name, TenantId, fields, rows } = input;

  if (!TenantId) throwUserInputError("TenantId is required");
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

  if (!name) throwUserInputError("Database name is required");

  const savedDatabase = new Database({
    name,
    fields: fields || [],
    Tenant: TenantId,
    createdBy: contextUser._id,
  });

  await savedDatabase.save();

  if (!fields || fields.length === 0) {
    return { database: savedDatabase, rows: [] };
  }

  if (!rows || rows.length === 0) {
    return { database: savedDatabase, rows: [] };
  }

  const rowDocs = rows.map((r) => ({
    Tenant: TenantId,
    database: savedDatabase._id,
    values: r.values.map((v, i) => {
      const field = savedDatabase.fields[i];
      if (!field) throwUserInputError(`No field found at index ${i}`);

      let value = v.value;

      if (field.type === "number") value = Number(value);

      if (field.type === "multi-select" && !Array.isArray(value))
        value = [value];

      if (field.type === "select" && !field.options.includes(value)) {
        console.warn(`Value "${value}" not in options for "${field.name}"`);
      }

      return { fieldId: field._id, value };
    }),
  }));

  const savedRows = await Row.insertMany(rowDocs);

  return { database: savedDatabase, rows: savedRows };
};

export const deleteDatabasesByIds = async (input, contextUser) => {
  const { TenantId, databaseIds } = input;

  if (!TenantId) throwUserInputError("TenantId is required");
  if (!Array.isArray(databaseIds) || databaseIds.length === 0)
    throwUserInputError("databaseIds array is required");

  graphQlvalidateObjectId(TenantId, "Tenant ID");
  databaseIds.forEach((id) => graphQlvalidateObjectId(id, "Database ID"));

  const tenant = await Tenant.findById(TenantId);
  if (!tenant) throwUserInputError("Tenant not found");

  const member = tenant.members.find(
    (m) =>
      m.tenantUserId.toString() === contextUser._id.toString() && m.isActive
  );
  if (!member) throwUserInputError("User is not a member of this tenant");

  const existingDatabases = await Database.find({
    _id: { $in: databaseIds },
  });

  if (existingDatabases.length !== databaseIds.length) {
    const existingIds = existingDatabases.map((db) => db._id.toString());
    const invalidDbIds = databaseIds.filter((id) => !existingIds.includes(id));
    throwUserInputError(` Database Not Found: ${invalidDbIds.join(", ")}`);
  }

  await Row.deleteMany({ database: { $in: databaseIds } });

  await Database.deleteMany({ _id: { $in: databaseIds } });

  return { success: true, deletedDatabaseIds: databaseIds };
};
