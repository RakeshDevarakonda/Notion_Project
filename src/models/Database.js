import mongoose from "mongoose";


const fieldSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    options: [String],
    databaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Database",
      required: true,
    },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
  },
  { timestamps: true }
);



const entrySchema = new mongoose.Schema(
  {
    values: [
      {
        fieldId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Field",
          required: true,
        },
        value: mongoose.Schema.Types.Mixed,
      },
    ],
    databaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Database",
      required: true,
    },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
  },
  { timestamps: true }
);

const rowSchema = new mongoose.Schema(
  {
    databaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Database",
      required: true,
    },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
    entryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Entry",
      required: true,
    },
    rowName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const databaseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    fields: [{ type: mongoose.Schema.Types.ObjectId, ref: "Field" }],
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
    entries: [
      {
        entryId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Entry",
          required: true,
        },
        rowId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Row",
          required: true,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Database = mongoose.model("Database", databaseSchema);
export const Field = mongoose.model("Field", fieldSchema);
export const Entry = mongoose.model("Entry", entrySchema);
export const Row = mongoose.model("Row", rowSchema);
