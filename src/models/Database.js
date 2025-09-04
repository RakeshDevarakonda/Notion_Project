import mongoose from "mongoose";

const FieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
  },
  options: [String],
  relation: { type: mongoose.Schema.Types.ObjectId, ref: "Database" },
});

const DatabaseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fields: [FieldSchema],
    createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TenantUser",
  },

  Tenant: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
});

const ValueSchema = new mongoose.Schema({
  database: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Database",
  },


  fieldId: { type: mongoose.Schema.Types.ObjectId, required: true },
  value: mongoose.Schema.Types.Mixed,
});

const RowSchema = new mongoose.Schema({
  database: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Database",
    required: true,
  },
  Tenant: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
  values: [ValueSchema],
});

export const Row = mongoose.model("Row", RowSchema);

export const Database = mongoose.model("Database", DatabaseSchema);
