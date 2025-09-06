import express from "express";
import {
  acceptInvite,
  changeMemberRole,
  createTenant,
  deleteTenant,
  getTenantById,
  inviteUserToTenant,
  rejectInvite,
  removeMember,
  updateTenantName,
} from "../controllers/tenantController.js";
import { isAuthenticated } from "../../middleware/authmiddleware.js";
import {  validateAcceptInvite, validateCreateTenant, validateGetTenantById, validateInviteUserToTenant, validateRejectInvite } from "../../utils/validate.js";
import { authorizeTenantRoles, checkTenantMember } from "../../middleware/authorizeRoles.js";

const tenantRouter = express.Router();


tenantRouter.get("/gettenant/:tenantId", isAuthenticated, validateGetTenantById, checkTenantMember,getTenantById);

tenantRouter.post("/createtenant", isAuthenticated, validateCreateTenant, createTenant);

tenantRouter.post("/inviteuser/:tenantId", isAuthenticated, validateInviteUserToTenant, checkTenantMember,authorizeTenantRoles("Admin"),inviteUserToTenant);

tenantRouter.post("/acceptinvite/:acceptId", isAuthenticated, validateAcceptInvite, acceptInvite);

tenantRouter.post("/rejectinvite/:rejectId", isAuthenticated, validateRejectInvite, rejectInvite);

tenantRouter.put("/updateTenantName/:tenantId", isAuthenticated, checkTenantMember,authorizeTenantRoles("Admin"),updateTenantName);

tenantRouter.put( "/changerole", isAuthenticated, checkTenantMember, authorizeTenantRoles("Admin"), changeMemberRole );

tenantRouter.delete("/deletetenant/:tenantId", isAuthenticated, checkTenantMember, authorizeTenantRoles("Admin"),deleteTenant);

tenantRouter.delete( "/removemember", isAuthenticated, checkTenantMember, authorizeTenantRoles("Admin"), removeMember );








export default tenantRouter;

