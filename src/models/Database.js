import mongoose from "mongoose";

const FieldSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: [
        "string",
        "number",
        "boolean",
        "date",
        "select",
        "multi-select",
        "relation",
      ], // allowed field types
    },
    options: {
      type: [String], // only needed for select / multi-select
      default: [],
    },
  },
  { timestamps: true }
);

const DatabaseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    fields: [FieldSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TenantUser",
    },

    Tenant: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
  },
  { timestamps: true }
);

const ValueSchema = new mongoose.Schema(
  {
    database: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Database",
    },

    fieldId: { type: mongoose.Schema.Types.ObjectId, required: true },
    value: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

const RowSchema = new mongoose.Schema(
  {
    database: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Database",
      required: true,
    },
    Tenant: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
    values: [ValueSchema],
  },
  { timestamps: true }
);

export const Row = mongoose.model("Row", RowSchema);

export const Database = mongoose.model("Database", DatabaseSchema);
