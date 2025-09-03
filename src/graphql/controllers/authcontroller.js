import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import Tenant from "../../models/Tenant.js";
import { throwError } from "../../utils/throwError.js";
import { generateUniqueTenantName } from "../../utils/createtenentname.js";

const saltRounds = process.env.saltRounds || 10;

export const signup = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throwError(400, "User already exists with this email");
  }

  const tenantName = await generateUniqueTenantName();

  const tenant = await Tenant.create({ name: tenantName });
  

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    tenantId: tenant._id,
    role: "Admin",
  });

  const token = jwt.sign(
    { id: user._id, tenantId: tenant._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return { user, token };
  
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throwError(404, "User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throwError(401, "Invalid credentials");

  const token = jwt.sign(
    { id: user._id, tenantId: user.tenantId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return { user, token };
};

export const getsingleuser = async ({ id }) => {
  const user = await User.findById(id); 
  if (!user) throwError(404, "User not found");
  return { user };
};
