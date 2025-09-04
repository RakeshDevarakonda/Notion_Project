import GraphQLJSON from "graphql-type-json";
import { throwUserInputError } from "../../utils/throwError.js";
import { createNewRow, deleteRowsByIds } from "../services/mutations/rowsMutaionService.js";
import { getRowDetails } from '../services/Queries/rowQueryService.js';

export const rowsResolver = {
  JSON: GraphQLJSON,

  Query: {
    getRowById: async (_, { TenantId, rowId, databaseId }, context) => {
      if (!context.user) throwUserInputError("Authentication required");
      const result = await getRowDetails(
        TenantId,
        rowId,
        databaseId,
        context.user
      );
      return result;
    },
  },

  Mutation: {
    createNewRow: async (_, { input }, context) => {
      if (!context.user) throwUserInputError("Authentication required");
      const result = await createNewRow(input, context.user);
      return result;
    },

    deleteRows: async (_, { input }, context) => {
      if (!context.user) throwUserInputError("Authentication required");
      const result = await deleteRowsByIds(input, context.user);
      return result;
    },
  },
};
