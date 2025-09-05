import GraphQLJSON from "graphql-type-json";
import {
  addFieldandValues,
  deleteFields,
  editValueById,
  updateMultipleFields,
} from "../services/mutations/fieldAndValuesMutaionService.js";
import {
  getValuesByField,
  keywordSearchService,
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
      async (_, { input }) => {
        const result = await getRelationDatabaseDetails(input);
        return result;
      }
    ),

    keywordSearch: composeMiddlewares(checkTenantMemberGraphql)(
      async (
        _,
        { TenantId, databaseId, searchByValueName, searchByFieldName },
        context
      ) => {
        const result = await keywordSearchService(
          TenantId,
          databaseId,
          searchByValueName,
          searchByFieldName,
          context.user
        );
        return result;
      }
    ),
  },

  Mutation: {
    addFieldandValues: composeMiddlewares(
      checkTenantMemberGraphql,
      authorizeTenantRolesGraphql("Admin")
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
