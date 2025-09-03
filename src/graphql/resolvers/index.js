import { authresolvers } from "./authresolver.js";


export const resolvers = {
  Query: {
    ...authresolvers.Query,

  },
  Mutation: {
    ...authresolvers.Mutation,

  },
};