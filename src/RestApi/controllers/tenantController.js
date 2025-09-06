import { validationResult } from "express-validator";
import Tenant from "../../models/Tenant.js";
import TenantUser from "../../models/TenantUser.js";
import { throwError } from "../../utils/throwError.js";
import { validateObjectId } from "../../utils/validate.js";
import { Database, Row } from "../../models/Database.js";

export const createTenant = async (req, res, next) => {
  try {
    const { name } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user._id;


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

    const user = await TenantUser.findById(userId);
    if (!user) return throwError(404, "User not found");

    const tenant = await Tenant.create({
      name,
      createdBy: userId,
      members: [{ tenantUserId: userId, email: req.user.email, role: "Admin" }],
      invites: [],
    });

    user.accessTenants.push({ tenantId: tenant._id });
    await user.save();

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

    if (
      !tenant.members.some(
        (m) => m.tenantUserId.toString() === req.user._id.toString()
      )
    )
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
    const { email, role } = req.body;

    if (!role) {
      throwError(400, "Role is required");
    }

    const allowedRoles = ["Editor", "Viewer"];
    if (!allowedRoles.includes(role)) {
      return throwError(400, "Invalid role provided");
    }

    const tenant = await Tenant.findById(tenantId).populate("createdBy");
    if (!tenant) return throwError(404, "Tenant not found");



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
      role,
      status: "Pending",
    });

    await tenant.save();

    userToInvite.invites.push({
      tenantId,
      email: tenant.createdBy.email,
      status: "Pending",
      role,
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
    const { acceptId } = req.params;
    const userId = req.user._id.toString();

    validateObjectId(acceptId, "Accept ID");

    const user = await TenantUser.findById(userId);
    if (!user) return throwError(404, "User not found");

    const invite = user.invites.find((inv) => inv._id.toString() === acceptId);
    if (!invite) return throwError(403, "No pending invitation found");

    if (invite.status === "Accepted")
      return throwError(400, "Invite already accepted");
    if (invite.status === "Rejected")
      return throwError(400, "Invite already rejected");

    const tenant = await Tenant.findById(invite.tenantId);
    if (!tenant) return throwError(404, "Tenant not found");

    const tenantInvite = tenant.invites.find(
      (inv) =>
        inv.tenantUserId.toString() === userId && inv.status === "Pending"
    );
    if (tenantInvite) tenantInvite.status = "Accepted";

    invite.status = "Accepted";

    const alreadyMember = tenant.members.some(
      (m) => m.tenantUserId.toString() === userId
    );
    if (!alreadyMember) {
      tenant.members.push({
        tenantUserId: userId,
        email: user.email,
        role: invite.role,
      });
    }

    const alreadyHasAccess = user.accessTenants.some(
      (at) => at.tenantId.toString() === tenant._id.toString()
    );
    if (!alreadyHasAccess) {
      user.accessTenants.push({ tenantId: tenant._id });
    }

    await user.save();
    await tenant.save();

    res.status(200).json({ message: "Invite accepted", tenant });
  } catch (err) {
    next(err);
  }
};

export const rejectInvite = async (req, res, next) => {
  try {
    const { rejectId } = req.params;
    const userId = req.user._id.toString();

    validateObjectId(rejectId, "Reject ID");

    const user = await TenantUser.findById(userId);
    if (!user) return throwError(404, "User not found");

    const invite = user.invites.find((inv) => inv._id.toString() === rejectId);
    if (!invite) return throwError(403, "No pending invitation found");

    if (invite.status === "Accepted")
      return throwError(400, "Invite already accepted");
    if (invite.status === "Rejected")
      return throwError(400, "Invite already rejected");

    const tenant = await Tenant.findById(invite.tenantId);
    if (!tenant) return throwError(404, "Tenant not found");

    if (tenant.members.some((m) => m.tenantUserId.toString() === userId)) {
      return throwError(403, "User is already a member and cannot reject");
    }

    invite.status = "Rejected";

    const tenantInvite = tenant.invites.find(
      (inv) =>
        inv.tenantUserId.toString() === userId && inv.status === "Pending"
    );
    if (tenantInvite) tenantInvite.status = "Rejected";

    await user.save();
    await tenant.save();

    res.status(200).json({ message: "Invite rejected", tenant });
  } catch (err) {
    next(err);
  }
};

export const updateTenantName = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const { name } = req.body;

    validateObjectId(tenantId, "Tenant ID");
    if (!name || name.trim() === "") return throwError(400, "Tenant name is required");

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return throwError(404, "Tenant not found");

    tenant.name = name;
    await tenant.save();
    res
      .status(200)
      .json({ message: "Tenant name updated successfully", tenant });
  } catch (err) {
    next(err);
  }
};

export const deleteTenant = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    validateObjectId(tenantId, "Tenant ID");

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return throwError(404, "Tenant not found");

    await Tenant.findByIdAndDelete(tenantId);
    await Database.deleteMany({ Tenant: tenantId });
    await Row.deleteMany({ Tenant: tenantId });

    await TenantUser.updateMany(
      { "accessTenants.tenantId": tenantId },
      { $pull: { accessTenants: { tenantId: tenantId } } }
    );

    res.status(200).json({ message: "Tenant deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const changeMemberRole = async (req, res, next) => {
  try {
    const { role, tenantId, memberId } = req.body;

    if (!role || role.trim() === "") return throwError(400, "Role is required");
    validateObjectId(tenantId, "Tenant ID");
    validateObjectId(memberId, "Member ID");

    if (!["Editor", "Viewer"].includes(role)) {
      return throwError(400, "Invalid role provided");
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return throwError(404, "Tenant not found");

    const member = tenant.members.id(memberId);
    if (!member) return throwError(404, "Member not found");

    member.role = role;
    await tenant.save();

    res.status(200).json({ message: "Role updated successfully", tenant });
  } catch (err) {
    next(err);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { tenantId, memberId } = req.body;

    validateObjectId(tenantId, "Tenant ID");
    validateObjectId(memberId, "Member ID");

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return throwError(404, "Tenant not found");

    const member = tenant.members.id(memberId);
    if (!member) return throwError(404, "Member not found");

    member.deleteOne();
    await tenant.save();

    await Tenant.updateOne(
      { _id: tenantId },
      { $pull: { invites: { tenantUserId: member.tenantUserId } } }
    );

    await TenantUser.updateOne(
      { _id: member.tenantUserId },
      {
        $pull: {
          invites: { tenantId: tenantId },
          accessTenants: { tenantId: tenantId },
        },
      }
    );

    res.status(200).json({ message: "Member removed successfully", tenant });
  } catch (err) {
    next(err);
  }
};
