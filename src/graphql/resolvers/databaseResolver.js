import GraphQLJSON from "graphql-type-json";
import { throwUserInputError } from "../../utils/throwError.js";
import { createDBWithRow, deleteDatabasesByIds } from "../services/mutations/databasemutationService.js";
import { getDatabaseDetails } from '../services/queries/databaseQueryServices.js';


export const databaseResolver = {
  JSON: GraphQLJSON,

  Query: {
    getDatabaseData: async (_, { TenantId, databaseId ,page,limit}, context) => {
      if (!context.user) throwUserInputError("Authentication required");
      const result = await getDatabaseDetails(
        TenantId,
        databaseId,
        context.user,
        page,limit

      );
      return result;
    },
  },

  Mutation: {
    createDatabaseWithRows: async (_, { input }, context) => {
      if (!context.user) throwUserInputError("Authentication required");
      const result = await createDBWithRow(input, context.user);
      return result;
    },

    deleteDatabases: async (_, { input }, context) => {
      if (!context.user) throwUserInputError("Authentication required");
      const result = await deleteDatabasesByIds(input, context.user);
      return result;
    },
  },
};
