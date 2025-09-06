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
      throwUserInputError(`Invalid Rows or these rows not found in this db ${notFoundRowIds.join(", ")} `);
    }
  }

  if (!rows || rows.length === 0) {
    throwUserInputError("Rows not found");
  }

  return { rows };
};
