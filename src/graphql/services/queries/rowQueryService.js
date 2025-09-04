import { Database, Row } from "../../../models/Database.js";
import Tenant from "../../../models/Tenant.js";
import { throwUserInputError } from "../../../utils/throwError.js";
import { graphQlvalidateObjectId } from "../../../utils/validate.js";

export const getRowDetails = async (
  TenantId,
  rowId,

  databaseId,

  contextUser
) => {
  if (!TenantId) throwUserInputError("TenantId is required");
  if (!databaseId) throwUserInputError("DatabaseId is required");

  graphQlvalidateObjectId(TenantId, "Tenant ID");
  graphQlvalidateObjectId(databaseId, "Database ID");

  const tenant = await Tenant.findById(TenantId);
  if (!tenant) throwUserInputError("Tenant not found");

  const member = tenant.members.find(
    (m) =>
      m.tenantUserId.toString() === contextUser._id.toString() && m.isActive
  );
  if (!member) throwUserInputError("User not a member of this tenant");

  const database = await Database.findById(databaseId);
  if (!database) throwUserInputError("Database not found");
  const row = await Row.findById(rowId);

  if (!row) throwUserInputError("Row not found");

  return { row };
};
