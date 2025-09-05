import mongoose from "mongoose";
import { Row, Database } from "../../../models/Database.js";
import Tenant from "../../../models/Tenant.js";
import { throwUserInputError } from "../../../utils/throwError.js";
import { graphQlvalidateObjectId } from "../../../utils/validate.js";

export const getValuesByField = async (input, contextUser) => {
  const {
    TenantId,
    databaseId,
    fieldId,
    page = 1,
    limit = 10,
    sort = 1,
  } = input;

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

  const sameCheck = await Database.findOne({
    _id: databaseId,
    tenantId: TenantId,
  });

  if (!sameCheck) {
    throwUserInputError("Database not found for this tenant");
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

export const keywordSearchService = async (
  TenantId,
  databaseId,
  searchByValueName,
  searchByFieldName,
  contextUser
) => {
  if (!TenantId || !databaseId)
    throwUserInputError("TenantId, databaseId are required");

  graphQlvalidateObjectId(TenantId, "Tenant ID");
  graphQlvalidateObjectId(databaseId, "Database ID");

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

  const tenant = await Tenant.findById(tenantObjectId);
  if (!tenant) throwUserInputError("Tenant not found");

  const member = tenant.members.find(
    (m) =>
      m.tenantUserId.toString() === contextUser._id.toString() && m.isActive
  );
  if (!member) throwUserInputError("User is not a member of this tenant");

  const database = await Database.findById(dbObjectId).lean();
  if (!database) throwUserInputError("Database not found");
  

  const sameCheck = await Database.findOne({
    _id: databaseId,
    tenantId: TenantId,
  });

  if (!sameCheck) {
    throwUserInputError("Database not found for this tenant");
  }

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
