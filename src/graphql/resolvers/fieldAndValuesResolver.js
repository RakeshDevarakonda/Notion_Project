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
  validateInputGraphql,
} from "../../middleware/authorizeRoles.js";
import {
  createFieldAndValuesSchema,
  deleteFieldsSchema,
  editValueByIdSchema,
  updateMultipleFieldsSchema,
} from "../../utils/joiValidations.js";

export const fieldAndValuesResolver = {
  JSON: GraphQLJSON,

  Query: {
    getValuesByField: composeMiddlewares(checkTenantMemberGraphql)(
      async (_, { input }, context) => {
        const result = await getValuesByField(input, context.user);
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
      validateInputGraphql(createFieldAndValuesSchema),
      authorizeTenantRolesGraphql("Admin")
    )(async (_, { input }, context) => {
      if (!context.user) throwUserInputError("Authentication required");
      const result = await createFieldandValues(input, context.user);
      return result;
    }),

    updateValues: composeMiddlewares(
      checkTenantMemberGraphql,
      validateInputGraphql(editValueByIdSchema),
      authorizeTenantRolesGraphql("Admin", "Editor")
    )(async (_, { input }, context) => {
      if (!context.user) throwUserInputError("Authentication required");
      const result = await editValueById(input, context.user);
      return result;
    }),

    updateMultipleFields: composeMiddlewares(
      checkTenantMemberGraphql,
      validateInputGraphql(updateMultipleFieldsSchema),

      authorizeTenantRolesGraphql("Admin", "Editor")
    )(async (_, { input }, context) => {
      if (!context.user) throwUserInputError("Authentication required");
      const result = await updateMultipleFields(input, context.user);
      return result;
    }),
    deleteFields: composeMiddlewares(
      validateInputGraphql(deleteFieldsSchema),

      checkTenantMemberGraphql,
      authorizeTenantRolesGraphql("Admin")
    )(async (_, { input }, context) => {
      if (!context.user) throwUserInputError("Authentication required");
      const result = await deleteFields(input, context.user);
      return result;
    }),
  },
};
