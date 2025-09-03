import mongoose from "mongoose";

/** -----------------------------
 * Field / Column Model
 * ----------------------------- */
const fieldSchema = new mongoose.Schema({
  fieldId: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ["text", "number", "date", "boolean", "select", "multi-select", "relation"]
  },
  options: { type: [String], default: [] },
  relation: { type: mongoose.Schema.Types.ObjectId, default: null },
  createdTime: { type: Date, default: Date.now },
  lastEditedTime: { type: Date, default: Date.now },
}, { _id: false });

/** -----------------------------
 * Row Value Schema
 * ----------------------------- */
const rowValueSchema = new mongoose.Schema({
  fieldId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Field" },
  value: { type: mongoose.Schema.Types.Mixed },
}, { _id: false });

/** -----------------------------
 * Row Schema (stored inside Database)
 * ----------------------------- */
const rowSchema = new mongoose.Schema({
  rowId: { type: mongoose.Schema.Types.ObjectId, auto: true },
  values: { type: [rowValueSchema], default: [] },
  createdTime: { type: Date, default: Date.now },
  lastEditedTime: { type: Date, default: Date.now },
}, { _id: false });

/** -----------------------------
 * Database Model (with rows inside)
 * ----------------------------- */
const databaseSchema = new mongoose.Schema({
  databaseId: { type: mongoose.Schema.Types.ObjectId, auto: true },
  title: { type: String, required: true },
  fields: [{ type: mongoose.Schema.Types.ObjectId, ref: "Field" }], // reference Field documents
  rows: { type: [rowSchema], default: [] },                         // store rows inside database
  createdTime: { type: Date, default: Date.now },
  lastEditedTime: { type: Date, default: Date.now },
});

const Database = mongoose.model("Database", databaseSchema);

export { Field, Database };
