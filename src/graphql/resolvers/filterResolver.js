import {
  checkTenantMemberGraphql,
  composeMiddlewares,
} from "../../middleware/authorizeRoles.js";
import { getFilteredRows } from "../services/queries/filterQueryServices.js";

export const filterResolver = {
  Query: {
    getFilteredRows: composeMiddlewares(checkTenantMemberGraphql)(
      async (_, { input },context) => {
        const result = await getFilteredRows(input,context.databasedetails);
        return result;
      }
    ),
  },
  Mutation: {},
};
