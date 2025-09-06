import { Database, Row } from "../../../models/Database.js";

export const getDatabaseDetails = async (
  databaseId,
  page = 1,
  limit = 10,
  sort = -1,
  databasedetails
) => {
  if (page <= 0 || limit <= 0 || (sort !== 1 && sort !== -1)) {
    throwUserInputError(
      "Invalid input: page and limit must be greater than 0, sort must be 1 or -1"
    );
  }

  const totalRows = await Row.countDocuments({ database: databaseId });
  const rows = await Row.find({ database: databaseId })
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ updatedAt: sort });

  return { database: databasedetails, rows, page, limit, sort, totalRows };
};
