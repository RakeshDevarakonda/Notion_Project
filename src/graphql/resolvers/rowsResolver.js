import GraphQLJSON from "graphql-type-json";
import {
  createNewRows,
  deleteRowsByIds,
} from "../services/mutations/rowsMutaionService.js";
import { getRowDetails } from "../services/Queries/rowQueryService.js";
import {
  authorizeTenantRolesGraphql,
  checkTenantMemberGraphql,
  composeMiddlewares,
} from "../../middleware/authorizeRoles.js";

export const rowsResolver = {
  JSON: GraphQLJSON,

  Query: {
    getRowByIds: composeMiddlewares(checkTenantMemberGraphql)(
      async (_, {  rowIds, databaseId ,TenantId}) => {
        const result = await getRowDetails(rowIds, databaseId,TenantId);
        return result;
      }
    ),
  },

  Mutation: {
    createNewRows: composeMiddlewares(
      checkTenantMemberGraphql,
      authorizeTenantRolesGraphql("Admin", "Editor")
    )(async (_, { input }) => {
      const result = await createNewRows(input);
      return result;
    }),

    deleteRows: composeMiddlewares(
      checkTenantMemberGraphql,
      authorizeTenantRolesGraphql("Admin")
    )(async (_, { input }, context) => {
      const result = await deleteRowsByIds(input);
      return result;
    }),
  },
};
