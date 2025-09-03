import { validationResult } from "express-validator";
import Tenant from "../../models/Tenant.js";
import TenantUser from "../../models/TenantUser.js";
import { throwError } from "../../utils/throwError.js";
import { validateObjectId } from "../../utils/validate.js";

export const createTenant = async (req, res, next) => {
  try {
    const { name } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user._id;

    if (!name) return throwError(400, "Tenant name is required");

    const userTenants = await Tenant.find({ createdBy: userId });
    const nameExistsInUserTenants = userTenants.some(
      (tenant) => tenant.name === name
    );

    if (nameExistsInUserTenants) {
      return throwError(
        400,
        "You have already created a tenant with this name."
      );
    }

    const tenant = await Tenant.create({
      name,
      createdBy: userId,
      members: [{ tenantUserId: userId, email: req.user.email }],
      invites: [],
      role: "Admin",
    });

    res.status(201).json({ tenant });
  } catch (err) {
    next(err);
  }
};

export const getTenantById = async (req, res, next) => {
  try {
    const { tenantId } = req.params;

    validateObjectId(tenantId, "Tenant ID");

    const tenant = await Tenant.findById(tenantId);

    if (!tenant) return throwError(404, "Tenant not found");

    if (!tenant.members.some((m) => m.tenantUserId.toString() === req.user._id.toString()))
      return throwError(400, "User is not a member");

    res.status(200).json({ tenant });
  } catch (err) {
    next(err);
  }
};


export const inviteUserToTenant = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    validateObjectId(tenantId, "Tenant ID");
    const { email } = req.body;
    const inviterId = req.user._id.toString();

    const tenant = await Tenant.findById(tenantId).populate("createdBy");
    if (!tenant) return throwError(404, "Tenant not found");

    const isMember = tenant.members.some(
      (m) => m.tenantUserId.toString() === inviterId
    );
    if (!isMember)
      return throwError(403, "You do not have permission to invite users");

    const userToInvite = await TenantUser.findOne({ email });
    if (!userToInvite) return throwError(404, "User not found");

    const userIdStr = userToInvite._id.toString();

    if (tenant.members.some((m) => m.tenantUserId.toString() === userIdStr))
      return throwError(400, "User is already a member");

    const existingInvite = tenant.invites.find(
      (inv) =>
        inv.tenantUserId.toString() === userIdStr &&
        ["Pending"].includes(inv.status)
    );
    if (existingInvite)
      return throwError(400, "User already has an invitation pending");

    tenant.invites.push({
      tenantUserId: userIdStr,
      email,
      status: "Pending",
    });
    await tenant.save();

    userToInvite.invites.push({
      tenantId,
      email: tenant.createdBy.email,
      status: "Pending",
    });
    await userToInvite.save();

    res
      .status(200)
      .json({ message: `User ${email} invited successfully`, tenant });
  } catch (err) {
    next(err);
  }
};

export const acceptInvite = async (req, res, next) => {
  try {
    const { tenantId } = req.params;

    validateObjectId(tenantId, "Tenant ID");
    const userId = req.user._id.toString();

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return throwError(404, "Tenant not found");

    const existingInvite = tenant.invites.find(
      (inv) => inv.tenantUserId.toString() === userId
    );
    if (existingInvite) {
      if (existingInvite.status === "Accepted") {
        return throwError(400, "Invite already accepted");
      }
      if (existingInvite.status === "Rejected") {
        return throwError(400, "Invite already rejected");
      }
    }

    const inviteObj = tenant.invites.find(
      (inv) =>
        inv.tenantUserId.toString() === userId && inv.status === "Pending"
    );
    if (!inviteObj) return throwError(403, "No pending invitation found");

    inviteObj.status = "Accepted";
    tenant.members.push({ tenantUserId: userId, email: req.user.email });
    await tenant.save();

    const user = await TenantUser.findById(userId);
    const userInvite = user.invites.find(
      (inv) => inv.tenantId.toString() === tenantId && inv.status === "Pending"
    );
    if (userInvite) userInvite.status = "Accepted";
    await user.save();

    res.status(200).json({ message: "Invite accepted", tenant });
  } catch (err) {
    next(err);
  }
};

export const rejectInvite = async (req, res, next) => {
  try {
    const { tenantId } = req.params;

    validateObjectId(tenantId, "Tenant ID");
    const userId = req.user._id.toString();

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return throwError(404, "Tenant not found");

    if (tenant.members.some((m) => m.tenantUserId.toString() === userId))
      return throwError(403, "User is already a member and cannot reject");

    const inviteObj = tenant.invites.find(
      (inv) =>
        inv.tenantUserId.toString() === userId && inv.status === "Pending"
    );
    if (!inviteObj) return throwError(403, "No pending invitation found");

    inviteObj.status = "Rejected";
    await tenant.save();

    const user = await TenantUser.findById(userId);
    const userInvite = user.invites.find(
      (inv) => inv.tenantId.toString() === tenantId && inv.status === "Pending"
    );
    if (userInvite) userInvite.status = "Rejected";
    await user.save();

    res.status(200).json({ message: "Invite rejected", tenant });
  } catch (err) {
    next(err);
  }
};
