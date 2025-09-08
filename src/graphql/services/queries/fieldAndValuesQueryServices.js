import mongoose from "mongoose";
import { Row, Database } from "../../../models/Database.js";
import { throwUserInputError } from "../../../utils/throwError.js";

export const getValuesByField = async (input) => {
  const {
    databaseId,
    fieldId,
    page = 1,
    limit = 10,
    descending = true,
  } = input;

  if (page <= 0 || limit <= 0) {
    throwUserInputError("Invalid input: page and limit must be greater than 0");
  }

  const database = await Database.findById(databaseId);

  const field = database.fields.id(fieldId);

  if (!field)
    throwUserInputError(`Field ${fieldId} not found in this database`);

  const totalValuesCount = await Row.countDocuments({ database: databaseId });

  const rows = await Row.find({ database: databaseId })
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

  values.sort((a, b) => {
    console.log(a);
    if (typeof a.value === "string" && typeof b.value === "string") {
      return descending
        ? b.value.localeCompare(a.value)
        : a.value.localeCompare(b.value);
    }
    return descending ? b.value - a.value : a.value - b.value;
  });

  return {
    values,
    page,
    field,
    descending,
    limit,
    totalValuesCount,
  };
};

export const getRelationDatabaseDetailsService = async (
  TenantId,
  databaseId,
  valueId,
  page,
  limit,
  sort
) => {
  page = Number(page) || 1;
  limit = Number(limit) || 10;
  sort = Number(sort);

  const skip = (page - 1) * limit;

  const valueDoc = await Row.findOne({
    "values._id": valueId,
    database: databaseId,
  }).lean();

  if (!valueDoc) {
    throwUserInputError(`Value ${valueId} not found in the specified database`);
  }

  const relatedDbId = valueDoc.values.find(
    (v) => v._id.toString() === valueId
  )?.value;
  if (!relatedDbId || !mongoose.Types.ObjectId.isValid(relatedDbId)) {
    throwUserInputError("Related database ID is invalid or missing");
  }

  const relatedDb = await Database.findById(relatedDbId).lean();
  if (!relatedDb) throwUserInputError("Related database not found");

  const [rows, totalRows] = await Promise.all([
    Row.find({ database: relatedDb._id })
      .sort({ createdAt: sort })
      .skip(skip)
      .limit(limit)
      .lean(),
    Row.countDocuments({ database: relatedDb._id }),
  ]);

  return {
    ...relatedDb,
    page,
    limit,
    sort,
    totalRows,
    rows,
  };
};
