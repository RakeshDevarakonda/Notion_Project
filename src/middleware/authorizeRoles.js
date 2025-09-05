import Tenant from "../models/Tenant.js";
import { throwUserInputError } from "../utils/throwError.js";
import {
  graphQlvalidateObjectId,
  validateObjectId,
} from "../utils/validate.js";

export const checkTenantMember = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const TenantId =
      req.body.TenantId ||
      req.body.tenantId ||
      req.query.TenantId ||
      req.params.TenantId ||
      req.params.tenantId;
    if (!TenantId) {
      return res.status(400).json({ error: "TenantId is required" });
    }

    validateObjectId(TenantId, "Tenant ID");

    const tenantDetails = await Tenant.findById(TenantId);
    if (!tenantDetails) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    const member = tenantDetails.members.find(
      (m) => m.tenantUserId.toString() === req.user._id.toString() && m.isActive
    );

    if (!member) {
      return res.status(403).json({
        error: "User is not a member of this tenant or might be inactive",
      });
    }

    req.tenantDetails = tenantDetails;
    req.member = member;

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const authorizeTenantRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.member) {
      return res.status(500).json({ error: "Tenant membership check missing" });
    }

    if (!allowedRoles.includes(req.member.role)) {
      return res.status(403).json({
        error: `Access denied: Only roles [${allowedRoles.join(
          ", "
        )}] can perform this action`,
      });
    }

    next();
  };
};

export const checkTenantMemberGraphql = (resolverFn) => {
  return async (parent, args, context, info) => {
    if (!context.user) {
      throwUserInputError("Authentication required");
    }

    const TenantId = args.TenantId || args.input?.TenantId;
    if (!TenantId) throwUserInputError("TenantId is required");

    graphQlvalidateObjectId(TenantId, "Tenant ID");

    const tenantDetails = await Tenant.findById(TenantId);
    if (!tenantDetails) throwUserInputError("Tenant not found");

    const member = tenantDetails.members.find(
      (m) =>
        m.tenantUserId.toString() === context.user._id.toString() && m.isActive
    );

    if (!member) {
      throwUserInputError(
        "User is not a member of this tenant or might be inactive"
      );
    }

    context.tenantDetails = tenantDetails;
    context.member = member;

    return resolverFn(parent, args, context, info);
  };
};

export const authorizeTenantRolesGraphql = (...allowedRoles) => {
  return (resolverFn) => {
    return async (parent, args, context, info) => {
      const member = context.member;
      if (!member) {
        throwUserInputError(
          "Tenant membership check missing before role check"
        );
      }

      if (!allowedRoles.includes(member.role)) {
        throwUserInputError(
          `Access denied: Only roles [${allowedRoles.join(
            ", "
          )}] can perform this action`
        );
      }

      return resolverFn(parent, args, context, info);
    };
  };
};

export const validateInputGraphql = (schema) => {
  return (resolverFn) => {
    return async (parent, args, context, info) => {
      const { error, value } = schema.validate(args.input, {
        abortEarly: false,
      });

      if (error) {
        throwUserInputError(
          `Validation error: ${error.details.map((d) => d.message).join(", ")}`
        );
      }

      args.input = value;

      return resolverFn(parent, args, context, info);
    };
  };
};

export const composeMiddlewares =
  (...middlewares) =>
  (resolverFn) =>
    middlewares.reduceRight((prev, mw) => mw(prev), resolverFn);
