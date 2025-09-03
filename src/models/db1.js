import mongoose from "mongoose";

/** -----------------------------
 * Field / Column Schema
 * ----------------------------- */
const fieldSchema = new mongoose.Schema({
  fieldId: { type: mongoose.Schema.Types.ObjectId, auto: true }, // auto-generated
  name: { type: String, required: true },                         // display name
  type: { 
    type: String, 
    required: true,
    enum: ["text", "number", "date", "boolean", "select", "multi-select", "relation"]
  },
  options: { type: [String], default: [] },                        // for select / multi-select
  relation: { type: mongoose.Schema.Types.ObjectId, default: null }, // references another database
}, { _id: false });

/** -----------------------------
 * Database Schema
 * ----------------------------- */
const databaseSchema = new mongoose.Schema({
  databaseId: { type: mongoose.Schema.Types.ObjectId, auto: true },
  title: { type: String, required: true },
  fields: { type: [fieldSchema], default: [] },                  // column definitions
  createdTime: { type: Date, default: Date.now },
  lastEditedTime: { type: Date, default: Date.now },
});
/** -----------------------------
 * Row Value Schema
 * ----------------------------- */
const rowValueSchema = new mongoose.Schema({
  fieldId: { type: mongoose.Schema.Types.ObjectId, required: true },  // reference to Database.fields
  fieldName: { type: String, required: true },                        // optional denormalized field name
  value: { type: mongoose.Schema.Types.Mixed },                        // actual value
}, { _id: false });

/** -----------------------------
 * Row Schema
 * ----------------------------- */
const rowSchema = new mongoose.Schema({
  rowId: { type: mongoose.Schema.Types.ObjectId, auto: true },
  databaseId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Database" },
  values: { type: [rowValueSchema], default: [] },
  createdTime: { type: Date, default: Date.now },
  lastEditedTime: { type: Date, default: Date.now },
});


const Row = mongoose.model("Row", rowSchema);


const Database = mongoose.model("Database", databaseSchema);
