import { body, param } from "express-validator";
import { throwError } from "./throwError.js";
import { UserInputError } from "apollo-server-errors";
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


export const graphQlvalidateObjectId = (id, name = "ID") => {
  if (!mongoose.isValidObjectId(id)) {
    throw new UserInputError(`Invalid ${name}`, { invalidArgs: [name] });
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

