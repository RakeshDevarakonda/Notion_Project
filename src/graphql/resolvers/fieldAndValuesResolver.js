import GraphQLJSON from "graphql-type-json";
import {
  addFieldandValues,
  deleteFields,
  editValueById,
  updateMultipleFields,
} from "../services/mutations/fieldAndValuesMutaionService.js";
import {
  getRelationDatabaseDetailsService,
  getValuesByField,
} from "../services/queries/fieldAndValuesQueryServices.js";
import {
  authorizeTenantRolesGraphql,
  checkTenantMemberGraphql,
  composeMiddlewares,
} from "../../middleware/authorizeRoles.js";

export const fieldAndValuesResolver = {
  JSON: GraphQLJSON,
  Query: {
    getValuesByField: composeMiddlewares(checkTenantMemberGraphql)(
      async (_, { input }) => {
        const result = await getValuesByField(input);
        return result;
      }
    ),

    getRelationDatabaseDetails: composeMiddlewares(checkTenantMemberGraphql)(
      async (_, { TenantId, databaseId, valueId, page, limit, sort }) => {
        const result = await getRelationDatabaseDetailsService(
          TenantId,
          databaseId,
          valueId,
          page,
          limit,
          sort
        );
        return result;
      }
    ),
  },

  Mutation: {
    addFieldandValues: composeMiddlewares(
      checkTenantMemberGraphql,
      authorizeTenantRolesGraphql("Admin", "Editor")
    )(async (_, { input }) => {
      const result = await addFieldandValues(input);
      return result;
    }),

    editMultipleValueById: composeMiddlewares(
      checkTenantMemberGraphql,
      authorizeTenantRolesGraphql("Admin", "Editor")
    )(async (_, { input }) => {
      const result = await editValueById(input);
      return result;
    }),

    editMultipleFields: composeMiddlewares(
      checkTenantMemberGraphql,
      authorizeTenantRolesGraphql("Admin", "Editor")
    )(async (_, { input }, context) => {
      const result = await updateMultipleFields(input, context.user);
      return result;
    }),
    deleteFields: composeMiddlewares(
      checkTenantMemberGraphql,
      authorizeTenantRolesGraphql("Admin")
    )(async (_, { input }) => {
      const result = await deleteFields(input);
      return result;
    }),
  },
};
