import { Database, Row } from "../../../models/Database.js";

export const getDatabaseDetails = async (databaseId, page = 1, limit = 10) => {
  const database = await Database.findById(databaseId);

  const totalRows = await Row.countDocuments({ database: databaseId });
  const rows = await Row.find({ database: databaseId })
    .skip((page - 1) * limit)
    .limit(limit);

  return { database, rows, page, limit, totalRows };
};
