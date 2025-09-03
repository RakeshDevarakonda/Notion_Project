import mongoose from "mongoose";

/** -----------------------------
 * Field / Column Model
 * ----------------------------- */
const fieldSchema = new mongoose.Schema({
  name: { type: String, required: true },  // display name
  type: { 
    type: String, 
    required: true,
    enum: ["text", "number", "date", "boolean", "select", "multi-select", "relation"]
  },
  options: { type: [String], default: [] },                        // for select / multi-select
  relation: { type: mongoose.Schema.Types.ObjectId, default: null }, // optional reference to another database
  createdTime: { type: Date, default: Date.now },
  lastEditedTime: { type: Date, default: Date.now },
});

const Field = mongoose.model("Field", fieldSchema);


/** -----------------------------
 * Database Model
 * ----------------------------- */
const databaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fields: [{ type: mongoose.Schema.Types.ObjectId, ref: "Field" }], // array of Field references
  createdTime: { type: Date, default: Date.now },
  lastEditedTime: { type: Date, default: Date.now },
});

const Database = mongoose.model("Database", databaseSchema);


/** -----------------------------
 * Row Value Schema
 * ----------------------------- */
const rowValueSchema = new mongoose.Schema({
  fieldId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Field" },
  value: { type: mongoose.Schema.Types.Mixed },  // can store text, number, date, boolean, etc.
}, { _id: false });


/** -----------------------------
 * Row Model
 * ----------------------------- */
const rowSchema = new mongoose.Schema({
  rowId: { type: mongoose.Schema.Types.ObjectId, auto: true },
  databaseId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Database" },
  values: { type: [rowValueSchema], default: [] }, // array of { fieldId, value }
  createdTime: { type: Date, default: Date.now },
  lastEditedTime: { type: Date, default: Date.now },
});

// Index to speed up queries by database
rowSchema.index({ databaseId: 1 });

const Row = mongoose.model("Row", rowSchema);


/** -----------------------------
 * Export Models
 * ----------------------------- */
export { Field, Database, Row };
