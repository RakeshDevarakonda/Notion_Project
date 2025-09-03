
import  mongoose  from 'mongoose';


const fieldSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    databaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Database",
      required: true,
    },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "number", "date", "boolean", "select"],
      required: true,
    },
    options: [{ label: String, value: String }],
  },
  { timestamps: true }
);

const databaseSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    name: { type: String, required: true },
    fields: [
      {
        fieldId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Field",
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const recordSchema = new mongoose.Schema(
  {
    databaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Database",
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    values: [
      {
        rowId: { type: mongoose.Schema.Types.ObjectId, auto: true },
        rowNumber: { type: Number, required: true },
        data: [
          {
            field: {
              fieldId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Field",
                required: true,
              },
              fieldName: { type: String, required: true },
              fieldType: { type: String, required: true },
            },
            value: {
              valueId: { type: mongoose.Schema.Types.ObjectId, auto: true },
              value: mongoose.Schema.Types.Mixed,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export const Field = mongoose.model("Field", fieldSchema);
export const Database = mongoose.model("Database", databaseSchema);
export const Record = mongoose.model("Record", recordSchema);
