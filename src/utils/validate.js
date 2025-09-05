import { body, param } from "express-validator";
import { throwError, throwUserInputError } from "./throwError.js";
import mongoose from "mongoose";

export const registerValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
];

export const loginValidation = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password required"),
];

export const validateObjectId = (id, name = "ID") => {
  if (!mongoose.isValidObjectId(id)) {
    throwError(400, `Invalid ${name}`);
  }
};

export const validateCreateTenant = [
  body("name").trim().notEmpty().withMessage("Tenant name is required"),
];

export const validateGetTenantById = [
  param("tenantId").notEmpty().withMessage("Invalid tenant ID"),
];

export const validateInviteUserToTenant = [
  param("tenantId").notEmpty().withMessage("Invalid tenant ID"),
  body("email").isEmail().withMessage("Valid email is required"),
];

export const validateAcceptInvite = [
  param("acceptId").notEmpty().withMessage("Invalid tenant ID"),
];

export const validateRejectInvite = [
  param("rejectId").notEmpty().withMessage("Invalid tenant ID"),
];

export const graphQlvalidateObjectId = (id, name = "ID") => {
  if (!mongoose.isValidObjectId(id)) {
    throw new UserInputError(`Invalid ${name}`, { invalidArgs: [name] });
  }
};

export const processFieldValue = async (
  field,
  value,
  TenantId,
  createdById
) => {
  const { name, options } = field;
  switch (field.type) {
    case "number":
      value = Number(value);
      if (isNaN(value))
        throwUserInputError(`Invalid number for field "${name}"`);
      return value;

    case "boolean":
      if (typeof value === "boolean") return value;
      const valStr = value.toString().trim();
      if (valStr === "true") return true;
      if (valStr === "false") return false;
      throwUserInputError(`Invalid boolean for field "${name}"`);

    case "multi-select":
      if (!Array.isArray(value)) {
        throwUserInputError(
          `Invalid value for multi-select field "${name}": must be an array of options`
        );
      }

      if (
        !Array.isArray(options) ||
        options.length === 0 ||
        !options ||
        options == undefined
      ) {
        throwUserInputError(
          `Multi-select field "${name}" must have options defined`
        );
      }
      for (const v of value) {
        if (!options.includes(v)) {
          throwUserInputError(
            `Invalid multi-select option "${v}" for field "${name}"`
          );
        }
      }
      return value;

    case "select":
      if (!options.includes(value)) {
        throwUserInputError(
          `Invalid select option "${value}" for field "${name}"`
        );
      }

      if (
        !Array.isArray(options) ||
        options.length === 0 ||
        !options ||
        options == undefined
      ) {
        throwUserInputError(`select field "${name}" must have options defined`);
      }
      return value;

    case "date":
      if (typeof value !== "string") {
        throwUserInputError(
          `Date must be a string in YYYY-MM-DD format for field "${name}"`
        );
      }
      const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(value);
      const dateObj = new Date(value);
      const [y, m, d] = value.split("-").map(Number);
      if (
        !isValidDate ||
        isNaN(dateObj.getTime()) ||
        dateObj.getFullYear() !== y ||
        dateObj.getMonth() + 1 !== m ||
        dateObj.getDate() !== d
      ) {
        throwUserInputError(`Invalid date for field "${name}". Use YYYY-MM-DD`);
      }
      return dateObj;

    case "relation":
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throwUserInputError(`Invalid ObjectId for relation field "${name}"`);
      }
      const relationDb = await Database.findById(value);
      if (!relationDb) {
        throwUserInputError(`Related database not found for field "${name}"`);
      }
      if (
        relationDb.createdBy.toString() !== createdById ||
        relationDb.Tenant.toString() !== TenantId
      ) {
        throwUserInputError(
          `Invalid relation for field "${name}": must belong to the same tenant and be created by the same user.`
        );
      }
      return new mongoose.Types.ObjectId(value);

    default:
      throwUserInputError(
        `Unsupported field type "${fieldtype}" for field "${name}"`
      );
  }
};
