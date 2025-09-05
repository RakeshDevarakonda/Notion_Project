import { Database, Row } from "../../../models/Database.js";
import Tenant from "../../../models/Tenant.js";
import { throwUserInputError } from "../../../utils/throwError.js";
import { graphQlvalidateObjectId } from "../../../utils/validate.js";

export const createNewRow = async (input, contextUser) => {
  const { TenantId, databaseId, values } = input;

  graphQlvalidateObjectId(TenantId, "Tenant ID");
  graphQlvalidateObjectId(databaseId, "Database ID");

  const tenantDetails = await Tenant.findById(TenantId);
  if (!tenantDetails) throwUserInputError("Tenant not found");

  const member = tenantDetails.members.find(
    (m) =>
      m.tenantUserId.toString() === contextUser._id.toString() && m.isActive
  );
  if (!member) throwUserInputError("You are not a member of this tenant");

  const database = await Database.findOne({
    _id: databaseId,
    Tenant: TenantId,
  });
  if (!database) throwUserInputError("Database not found for this tenant");

  const sameCheck = await Database.findOne({
    _id: databaseId,
    tenantId: TenantId,
  });

  if (!sameCheck) {
    throwUserInputError("Database not found for this tenant");
  }

  if (!Array.isArray(values) || values.length !== database.fields.length) {
    throwUserInputError(
      `Values length (${values.length}) does not match number of fields (${database.fields.length})`
    );
  }

  const rowValues = [];
  for (let i = 0; i < values.length; i++) {
    const field = database.fields[i];
    if (!field) throwUserInputError(`Field not found at index ${i}`);

    let value = values[i]?.value;

    // Handle required vs empty
    if (value === undefined || value === "") {
      value = null;
    }

    // Type-specific validation
    if (field.type === "number") {
      value = value !== null ? Number(value) : 0;
    }

    if (field.type === "boolean") {
      value = value !== null ? value : false;
    }

    if (field.type === "multi-select") {
      if (value !== null && !Array.isArray(value)) {
        value = [value];
      } else {
        value = [];
      }
    }

    if (field.type === "select") {
      value = value;
    }

    if (field.type === "relation") {
      if (value !== null) {
        graphQlvalidateObjectId(value, "Relation ID");

        const currentDbCreatedBy = database.createdBy.toString();
        const currentTenantId = database.Tenant.toString();

        const relationDb = await Database.findById(value);
        if (!relationDb) {
          throwUserInputError("Relation database not found");
        }

        const relationDbCreatedBy = relationDb.createdBy.toString();
        const relationTenantId = relationDb.Tenant.toString();

        if (
          currentDbCreatedBy !== relationDbCreatedBy ||
          currentTenantId !== relationTenantId
        ) {
          throwUserInputError(
            `Relation DB must belong to same creator and same tenant for field "${field.name}"`
          );
        }

        value = new mongoose.Types.ObjectId(value);
      }
    }

    rowValues.push({ fieldId: field._id, value });
  }

  const newRow = new Row({
    Tenant: TenantId,
    database: database._id,
    values: rowValues,
  });

  await newRow.save();
  return newRow;
};

export const deleteRowsByIds = async (input, contextUser) => {
  const { TenantId, databaseId, rowIds } = input;

  if (!TenantId) throwUserInputError("TenantId is required");
  if (!databaseId) throwUserInputError("DatabaseId is required");
  if (!Array.isArray(rowIds) || rowIds.length === 0)
    throwUserInputError("rowIds array is required");

  graphQlvalidateObjectId(TenantId, "Tenant ID");
  graphQlvalidateObjectId(databaseId, "Database ID");
  rowIds.forEach((id) => graphQlvalidateObjectId(id, "Row ID"));

  const tenant = await Tenant.findById(TenantId);
  if (!tenant) throwUserInputError("Tenant not found");

  const sameCheck = await Database.findOne({
    _id: databaseId,
    tenantId: TenantId,
  });

  if (!sameCheck) {
    throwUserInputError("Database not found for this tenant");
  }



  const member = tenant.members.find(
    (m) =>
      m.tenantUserId.toString() === contextUser._id.toString() && m.isActive
  );
  if (!member) throwUserInputError("User is not a member of this tenant");

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
