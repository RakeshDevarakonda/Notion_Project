import GraphQLJSON from "graphql-type-json";
import { throwUserInputError } from "../../utils/throwError.js";
import {
  createDBWithRowsAndValues,
  deleteDatabasesByIds,
  updateDatabase,
} from "../services/mutations/databasemutationService.js";
import { getDatabaseDetails } from "../services/queries/databaseQueryServices.js";
import {
  authorizeTenantRolesGraphql,
  checkTenantMemberGraphql,
  composeMiddlewares,
} from "../../middleware/authorizeRoles.js";

export const databaseResolver = {
  JSON: GraphQLJSON,

  Query: {
    getDatabaseData: composeMiddlewares(checkTenantMemberGraphql)(
      async (_, { databaseId, page, limit }) => {
        const result = await getDatabaseDetails(databaseId, page, limit);
        return result;
      }
    ),
  },

  Mutation: {
    createDatabaseWithRows: composeMiddlewares(
      checkTenantMemberGraphql,
      authorizeTenantRolesGraphql("Admin")
    )(async (_, { input }, context) => {
      const result = await createDBWithRowsAndValues(input, context.user);
      return result;
    }),

    updateDatabase: composeMiddlewares(
      checkTenantMemberGraphql,
      authorizeTenantRolesGraphql("Admin")
    )(async (_, { input }) => {
      const result = await updateDatabase(input);
      return result;
    }),

    deleteDatabases: composeMiddlewares(
      checkTenantMemberGraphql,
      authorizeTenantRolesGraphql("Admin")
    )(async (_, { input }) => {
      const result = await deleteDatabasesByIds(input);
      return result;
    }),
  },
};
