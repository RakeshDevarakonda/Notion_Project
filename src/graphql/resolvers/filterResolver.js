import {
  checkTenantMemberGraphql,
  composeMiddlewares,
} from "../../middleware/authorizeRoles.js";
import { getFilteredRows } from "../services/queries/filterQueryServices.js";

export const filterResolver = {
  Query: {
    getFilteredRows: composeMiddlewares(checkTenantMemberGraphql)(
      async (_, { input }) => {
        const result = await getFilteredRows(input);
        return result;
      }
    ),
  },
  Mutation: {},
};
