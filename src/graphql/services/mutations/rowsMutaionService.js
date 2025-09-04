export const createNewRow = async (input, contextUser) => {
  const { TenantId, databaseId, values } = input;

  graphQlvalidateObjectId(TenantId, "Tenant ID");
  graphQlvalidateObjectId(TenantId, "DatabaseId");

  const tenantDetails = await Tenant.findById(TenantId);
  if (!tenantDetails) throwUserInputError("Tenant not found");

  const member = tenantDetails.members.find(
    (m) =>
      m.tenantUserId.toString() === contextUser._id.toString() && m.isActive
  );
  if (!member) throwUserInputError("You are not a member of this tenant");

  const database = await Database.findById(databaseId);
  if (!database) throwUserInputError("Database not found");

  if (!Array.isArray(values) || values.length !== database.fields.length) {
    throwUserInputError(
      `Values length (${values.length}) does not match number of fields (${database.fields.length})`
    );
  }

  const rowValues = values.map((v, i) => {
    const field = database.fields[i];
    if (!field) throwUserInputError(`Field not found at index ${i}`);

    let value = v.value;

    if (value === undefined || value === "" || !value) value = null;

    if (field.type === "number") value = Number(value);

    if (field.type === "multi-select" && !Array.isArray(value)) value = [value];

    if (field.type === "select" && !field.options.includes(value)) {
      console.warn(`Value "${value}" not in options for field "${field.name}"`);
    }

    return { fieldId: field._id, value };
  });

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