import { authresolvers } from "./authresolver.js";
import { databaseResolver } from "./DatabaseResolver.js";


export const resolvers = {
  Query: {
    ...authresolvers.Query,

  },
  Mutation: {
    ...databaseResolver.Mutation,

  },
};