import { ApolloError, UserInputError } from "apollo-server-errors";

export const throwGraphQLError = (message, code = "INTERNAL_SERVER_ERROR") => {
  throw new ApolloError(message, code);
};

export const throwUserInputError = (message, invalidArgs = []) => {
  throw new UserInputError(message, { invalidArgs });
};

export const throwError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};
