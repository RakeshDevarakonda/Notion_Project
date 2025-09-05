import GraphQLJSON from "graphql-type-json";
import { throwUserInputError } from "../../utils/throwError.js";
import {
  createFieldandValues,
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
    createFieldAndValues: composeMiddlewares(
      checkTenantMemberGraphql,
      authorizeTenantRolesGraphql("Admin")
    )(async (_, { input }) => {
      const result = await createFieldandValues(input);
      return result;
    }),

    updateValues: composeMiddlewares(
      checkTenantMemberGraphql,
      authorizeTenantRolesGraphql("Admin", "Editor")
    )(async (_, { input }) => {
      const result = await editValueById(input);
      return result;
    }),

    updateMultipleFields: composeMiddlewares(
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
