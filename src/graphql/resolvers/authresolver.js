import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import TenantUser from "../../models/TenantUser.js";

export const authresolvers = {
  Query: {
    mydetails: async (_, { id }) => {
      const user = await TenantUser.findById(id).select("-password");
      if (!user) throw new Error("User not found");
      return user;
    },
  },

  Mutation: {
    signup: async (_, { name, email, password }) => {
      const existingUser = await TenantUser.findOne({ email });
      if (existingUser) throw new Error("User already exists");

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await TenantUser.create({
        name,
        email,
        password: hashedPassword,
      });

      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      return {
        user: newUser,
        token,
      };
    },

    login: async (_, { email, password }) => {
      const user = await TenantUser.findOne({ email });
      if (!user) throw new Error("Invalid credentials");

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error("Invalid credentials");

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      return {
        user,
        token,
      };
    },
  },
};
