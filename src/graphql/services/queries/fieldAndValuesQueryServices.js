import { Row, Database } from "../../../models/Database.js";
import Tenant from "../../../models/Tenant.js";
import { throwUserInputError } from "../../../utils/throwError.js";
import { graphQlvalidateObjectId } from "../../../utils/validate.js";

export const getValuesByField = async (input, contextUser) => {
  const { TenantId, databaseId, fieldId, page = 1, limit = 10 } = input;

  if (page <= 0 || limit <= 0) {
    throwUserInputError("page and limit must be greater than 0");
  }

  if (!TenantId || !databaseId || !fieldId)
    throwUserInputError("TenantId, databaseId and fieldId are required");

  graphQlvalidateObjectId(TenantId, "Tenant ID");
  graphQlvalidateObjectId(databaseId, "Database ID");
  graphQlvalidateObjectId(fieldId, "Field ID");

  const tenant = await Tenant.findById(TenantId);
  if (!tenant) throwUserInputError("Tenant not found");

  const member = tenant.members.find(
    (m) =>
      m.tenantUserId.toString() === contextUser._id.toString() && m.isActive
  );
  if (!member) throwUserInputError("User is not a member of this tenant");

  const database = await Database.findById(databaseId);
  if (!database) throwUserInputError("Database not found");

  const field = database.fields.id(fieldId);
  if (!field) throwUserInputError("Field not found in database");

  const totalValuesCount = await Row.countDocuments({ database: databaseId });

  const rows = await Row.find({ database: databaseId })
    .skip((page - 1) * limit)
    .limit(limit);

  // Filter values for the given field
  const values = [];
  rows.forEach((row) => {
    row.values.forEach((val) => {
      if (val.fieldId.toString() === fieldId.toString()) {
        values.push({
          rowId: row._id,
          valueId: val._id,
          value: val.value,
        });
      }
    });
  });

  console.log(values);

  return {
    field: {
      _id: field._id,
      name: field.name,
      type: field.type,
      options: field.options,
      relation: field.relation,
    },
    values,
    page,
    limit,
    totalValuesCount,
  };
};
