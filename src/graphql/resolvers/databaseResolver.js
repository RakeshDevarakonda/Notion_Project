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
  validateInputGraphql,
} from "../../middleware/authorizeRoles.js";
import {
  createDBWithRowSchema,
  deleteDatabasesSchema,
  updateDatabaseSchema,
} from "../../utils/joiValidations.js";

export const databaseResolver = {
  JSON: GraphQLJSON,

  Query: {
    getDatabaseData: composeMiddlewares(checkTenantMemberGraphql)(
      async (_, { TenantId, databaseId, page, limit }, context) => {
        if (!context.user) throwUserInputError("Authentication required");
        const result = await getDatabaseDetails(
          TenantId,
          databaseId,
          context.user,
          page,
          limit
        );
        return result;
      }
    ),
  },

  Mutation: {
    createDatabaseWithRows: composeMiddlewares(
      validateInputGraphql(createDBWithRowSchema),
      checkTenantMemberGraphql,
      authorizeTenantRolesGraphql("Admin")
    )(async (_, { input }, context) => {
      if (!context.user) throwUserInputError("Authentication required");
      const result = await createDBWithRowsAndValues(input, context.user);
      return result;
    }),

    updateDatabase: composeMiddlewares(
      validateInputGraphql(updateDatabaseSchema),
      checkTenantMemberGraphql,
      authorizeTenantRolesGraphql("Admin")
    )(async (_, { input }, context) => {
      if (!context.user) throwUserInputError("Authentication required");
      const result = await updateDatabase(input, context.user);
      return result;
    }),

    deleteDatabases: composeMiddlewares(
      validateInputGraphql(deleteDatabasesSchema),
      checkTenantMemberGraphql,
      authorizeTenantRolesGraphql("Admin")
    )(async (_, { input }, context) => {
      if (!context.user) throwUserInputError("Authentication required");
      const result = await deleteDatabasesByIds(input, context.user);
      return result;
    }),
  },
};
