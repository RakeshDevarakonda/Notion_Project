import GraphQLJSON from "graphql-type-json";
import { throwUserInputError } from "../../utils/throwError.js";
import { createFieldandValues, deleteFields, editValueById, updateMultipleFields } from "../services/mutations/fieldAndValuesMutaionService.js";


export const fieldAndValuesResolver = {
  JSON: GraphQLJSON,


  Mutation: {
   
    createFieldAndValues: async (_, { input }, context) => {
      if (!context.user) throwUserInputError("Authentication required");
      const result = await createFieldandValues(input, context.user);
      return result;
    },

    updateValues: async (_, { input }, context) => {
      if (!context.user) throwUserInputError("Authentication required");
      const result = await editValueById(input, context.user);
      return result;
    },

    updateMultipleFields: async (_, { input }, context) => {
      if (!context.user) throwUserInputError("Authentication required");
      const result = await updateMultipleFields(input, context.user);
      return result;
    },
    deleteFields: async (_, { input }, context) => {
      if (!context.user) throwUserInputError("Authentication required");
      const result = await deleteFields(input, context.user);
      return result;
    },

  
  },
};
