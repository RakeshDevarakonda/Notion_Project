import Joi from "joi";
import mongoose from "mongoose";

const dateStringJoi = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .required()
  .custom((value, helpers) => {
    const date = new Date(value);
    const [year, month, day] = value.split("-").map(Number);

    if (
      date.getFullYear() !== year ||
      date.getMonth() + 1 !== month ||
      date.getDate() !== day
    ) {
      return helpers.error("any.invalid", { message: "Invalid date" });
    }
    return value;
  }, "Strict YYYY-MM-DD date validation");

const objectIdJoi = () =>
  Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.objectIdJoi.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "objectIdJoi validation")
    .messages({
      "any.invalid": "{{#label}} must be a valid MongoDB objectIdJoi",
    });

const fieldSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string()
    .valid(
      "text",
      "number",
      "boolean",
      "select",
      "multi-select",
      "relation",
      "date"
    )
    .required(),
  options: Joi.array().items(Joi.string()),
});

const rowValueSchema = Joi.object({
  value: Joi.any().required(),
});

const rowSchema = Joi.object({
  values: Joi.array().items(rowValueSchema).required(),
});

export const createDBWithRowSchema = Joi.object({
  name: Joi.string().trim().required(),
  TenantId: objectIdJoi().required(),
  fields: Joi.array().items(fieldSchema).required(),
  rows: Joi.array().items(rowSchema),
});

export const updateDatabaseSchema = Joi.object({
  TenantId: objectIdJoi().required(),
  databaseId: objectIdJoi().required(),
  newName: Joi.string().trim().required(),
});

export const deleteDatabasesSchema = Joi.object({
  TenantId: Joi.string().required().messages({
    "any.required": "TenantId is required",
    "string.empty": "TenantId cannot be empty",
  }),
  databaseIds: Joi.array()
    .items(objectIdJoi().required())
    .min(1)
    .required()
    .messages({
      "any.required": "databaseIds array is required",
      "array.min": "databaseIds array must have at least 1 ID",
    }),
});

export const createFieldAndValuesSchema = Joi.object({
  TenantId: objectIdJoi().required().messages({
    "any.required": "TenantId is required",
  }),
  databaseId: objectIdJoi().required().messages({
    "any.required": "Database ID is required",
  }),
  fields: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        type: Joi.string()
          .valid(
            "text",
            "number",
            "boolean",
            "date",
            "select",
            "multi-select",
            "relation"
          )
          .required(),
        options: Joi.array().items(Joi.string()),
      })
    )
    .min(1)
    .required(),
  values: Joi.array()
    .items(
      Joi.object({
        rowId: objectIdJoi().required(),
        value: Joi.any().required(),
      })
    )
    .optional(),
});

export const editValueByIdSchema = Joi.object({
  TenantId: objectIdJoi().required().messages({
    "any.required": "TenantId is required",
  }),
  databaseId: objectIdJoi().required().messages({
    "any.required": "DatabaseId is required",
  }),
  updates: Joi.array()
    .items(
      Joi.object({
        rowId: objectIdJoi().required(),
        valueId: objectIdJoi().required(),
        newValue: Joi.any().required(),
      })
    )
    .min(1)
    .required()
    .messages({ "any.required": "Updates array is required" }),
});




export const updateMultipleFieldsSchema = Joi.object({
  TenantId: objectIdJoi().required().messages({
    "any.required": "TenantId is required",
  }),
  databaseId: objectIdJoi().required().messages({
    "any.required": "DatabaseId is required",
  }),
  updates: Joi.array()
    .items(
      Joi.object({
        fieldId: objectIdJoi().required(),
        values: Joi.object({
          name: Joi.string().optional(),
          type: Joi.string().valid(
            "text",
            "number",
            "boolean",
            "date",
            "select",
            "multi-select",
            "relation"
          ),
          options: Joi.array().items(Joi.string()).optional(),
          relation: Joi.string().optional(),
        }).required(),
      })
    )
    .min(1)
    .required()
    .messages({ "any.required": "Updates array is required" }),
});



export const deleteFieldsSchema = Joi.object({
  TenantId:objectIdJoi().required().messages({
    "any.required": "TenantId is required",
  }),
  databaseId: objectIdJoi().required().messages({
    "any.required": "DatabaseId is required",
  }),
  fieldIds: Joi.array()
    .items(objectIdJoi().required())
    .min(1)
    .required()
    .messages({
      "any.required": "fieldIds array is required",
      "array.min": "At least one fieldId must be provided",
    }),
})



const rowValueSchema2 = Joi.object({
  value: Joi.alternatives().try(
    Joi.string(),
    Joi.number(),
    Joi.boolean(),
    Joi.array().items(Joi.string()),
    Joi.allow(null)
  ),
});

export const createNewRowSchema = Joi.object({
  TenantId: objectIdJoi().required().messages({
    "any.required": "TenantId is required",
  }),
  databaseId: objectIdJoi().required().messages({
    "any.required": "DatabaseId is required",
  }),
  values: Joi.array()
    .items(rowValueSchema2)
    .min(1)
    .required()
    .messages({
      "any.required": "Values are required",
      "array.min": "At least one value must be provided",
    }),
});
