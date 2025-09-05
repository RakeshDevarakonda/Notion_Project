import GraphQLJSON from "graphql-type-json";
import { throwUserInputError } from "../../utils/throwError.js";
import {
  createNewRow,
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
    getRowById: composeMiddlewares(checkTenantMemberGraphql)(
      async (_, { TenantId, rowId, databaseId, page, limit }, context) => {
        if (!context.user) throwUserInputError("Authentication required");
        const result = await getRowDetails(
          TenantId,
          rowId,
          databaseId,
          context.user
        );
        return result;
      }
    ),
  },

  Mutation: {
    createNewRow: composeMiddlewares(
      checkTenantMemberGraphql,
      authorizeTenantRolesGraphql("Admin", "Editor")
    )(async (_, { input }, context) => {
      if (!context.user) throwUserInputError("Authentication required");
      const result = await createNewRow(input, context.user);
      return result;
    }),

    deleteRows: composeMiddlewares(
      checkTenantMemberGraphql,
      authorizeTenantRolesGraphql("Admin")
    )(async (_, { input }, context) => {
      if (!context.user) throwUserInputError("Authentication required");
      const result = await deleteRowsByIds(input, context.user);
      return result;
    }),
  },
};
