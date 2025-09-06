import { databaseResolver } from "./DatabaseResolver.js";
import { fieldAndValuesResolver } from "./fieldAndValuesResolver.js";
import { filterResolver } from "./filterResolver.js";
import { rowsResolver } from "./rowsResolver.js";

export const resolvers = {
  Query: {
    ...databaseResolver.Query,
    ...rowsResolver.Query,
    ...fieldAndValuesResolver.Query,
    ...filterResolver.Query,
  },
  Mutation: {
    ...databaseResolver.Mutation,
    ...rowsResolver.Mutation,
    ...fieldAndValuesResolver.Mutation,
  },
};
