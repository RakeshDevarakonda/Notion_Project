import express from "express";
import {
  acceptInvite,
  createTenant,
  getTenantById,
  inviteUserToTenant,
  rejectInvite,
} from "../controllers/tenantController.js";
import { isAuthenticated } from "../../middleware/authmiddleware.js";
import { validateAcceptOrRejectInvite, validateCreateTenant, validateGetTenantById, validateInviteUserToTenant } from "../../utils/validate.js";

const tenantRouter = express.Router();


tenantRouter.post("/createtenant", isAuthenticated, validateCreateTenant, createTenant);

tenantRouter.post("/gettenant/:tenantId", isAuthenticated, validateGetTenantById, getTenantById);

tenantRouter.post("/inviteuser/:tenantId", isAuthenticated, validateInviteUserToTenant, inviteUserToTenant);

tenantRouter.post("/acceptinvite/:tenantId", isAuthenticated, validateAcceptOrRejectInvite, acceptInvite);

tenantRouter.post("/rejectinvite/:tenantId", isAuthenticated, validateAcceptOrRejectInvite, rejectInvite);

export default tenantRouter;