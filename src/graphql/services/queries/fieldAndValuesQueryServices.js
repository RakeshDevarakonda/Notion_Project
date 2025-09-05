import mongoose from "mongoose";
import { Row, Database } from "../../../models/Database.js";
import { throwUserInputError } from "../../../utils/throwError.js";

export const getValuesByField = async (input) => {
  const { databaseId, fieldId, page = 1, limit = 10, sort = 1 } = input;

  if (page <= 0 || limit <= 0) {
    throwUserInputError("page and limit must be greater than 0");
  }

  const totalValuesCount = await Row.countDocuments({ database: databaseId });

  const rows = await Row.find({ database: databaseId })
    .sort({ updatedAt: sort })
    .skip((page - 1) * limit)
    .limit(limit);

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

  return {
    values,
    page,
    limit,
    totalValuesCount,
  };
};

export const keywordSearchService = async (
  TenantId,
  databaseId,
  searchByValueName,
  searchByFieldName,
) => {
  if (
    (!searchByValueName || searchByValueName.trim() === "") &&
    (!searchByFieldName || searchByFieldName.trim() === "")
  ) {
    throwUserInputError(
      "Either searchByValueName or searchByFieldName is required"
    );
  }

  const dbObjectId = new mongoose.Types.ObjectId(databaseId);
  const tenantObjectId = new mongoose.Types.ObjectId(TenantId);



  const database = await Database.findById(dbObjectId).lean();


  const fieldMap = new Map(database.fields.map((f) => [f._id.toString(), f]));

  const matchStage = {};

  if (searchByValueName) {
    matchStage["values.value"] = { $regex: searchByValueName, $options: "i" };
  }

  if (searchByFieldName) {
    const matchedFields = database.fields.filter((f) =>
      f.name.match(new RegExp(searchByFieldName, "i"))
    );
    const matchedFieldIds = matchedFields.map((f) => f._id);

    if (matchedFieldIds.length === 0) {
      return {
        query: { field: searchByFieldName, value: searchByValueName },
        count: 0,
        results: [],
      };
    }

    matchStage["values.fieldId"] = { $in: matchedFieldIds };
  }

  const results = await Row.aggregate([
    { $match: { database: dbObjectId, Tenant: tenantObjectId } },
    { $unwind: "$values" },
    { $match: matchStage },
    {
      $project: {
        rowId: "$_id",
        fieldId: "$values.fieldId",
        value: "$values.value",
      },
    },
  ]);

  const finalResults = results.map((r) => ({
    rowId: r.rowId,
    value: r.value,
    field: fieldMap.get(r.fieldId.toString()) || null,
  }));

  return {
    searchByFieldName,
    searchByValueName,
    count: finalResults.length,
    results: finalResults,
  };
};
