import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import TenantUser from "../../models/TenantUser.js";
import { throwError } from "../../utils/throwError.js";

const saltRounds = process.env.saltRounds || 10;

export const signup = async ({ name, email, password }) => {
  const existingUser = await TenantUser.findOne({ email });
  if (existingUser) {
    throwError(400, "User already exists with this email");
  }

  const tenantName = await generateUniqueTenantName();

  const tenant = await TenantUser.create({ name: tenantName });

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await TenantUser.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return { user, token };
};

export const login = async ({ email, password }) => {
  const user = await TenantUser.findOne({ email });
  if (!user) throwError(404, "User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throwError(401, "Invalid credentials");

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return { user, token };
};


