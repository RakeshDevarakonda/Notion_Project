import { getsingleuser, signup, login } from "../controllers/authcontroller.js";
import { throwError } from "../../utils/throwError.js";

export const authresolvers = {
  Query: {
    mydetails: async (_, { id }) => {
      try {
        const user = await getsingleuser({ id });
        if (!user) throwError(404, "User not found");
        return user;
      } catch (err) {
        throw err;
      }
    },
  },

  Mutation: {
    signup: async (_, { name, email, password }) => {
      try {
        const newUser = await signup({ name, email, password });
        if (!newUser) throwError(400, "Signup failed");
        return newUser;
      } catch (err) {
        throw err;
      }
    },
    login: async (_, { email, password }) => {
      try {
        const loggedInUser = await login({ email, password });
        if (!loggedInUser) throwError(401, "Invalid credentials");
        return loggedInUser;
      } catch (err) {
        throw err;
      }
    },
  },
};
