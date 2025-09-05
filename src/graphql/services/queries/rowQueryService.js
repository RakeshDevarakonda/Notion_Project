import { Row } from "../../../models/Database.js";
import { throwUserInputError } from "../../../utils/throwError.js";

export const getRowDetails = async (rowIds, databaseId, TenantId) => {
  const rows = await Row.find({
    _id: { $in: rowIds },
    database: databaseId,
    Tenant: TenantId,
  });

  if (rows.length !== rowIds.length) {
    const foundRowIds = rows.map((row) => row._id.toString());
    const notFoundRowIds = rowIds.filter(
      (rowId) => !foundRowIds.includes(rowId)
    );
    if (notFoundRowIds.length > 0) {
      throwUserInputError(`Rows with IDs ${notFoundRowIds.join(", ")} not found`);
    }
  }

  if (!rows || rows.length === 0) {
    throwUserInputError("Rows not found");
  }

  return { rows };
};
