import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import TenantUser from "../../models/TenantUser.js";
import { throwError } from "../../utils/throwError.js";
import { validationResult } from "express-validator";

const saltRounds = process.env.saltRounds || 10;

export const signup = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (password !== confirmPassword) {
      return throwError(400, "Password and Confirm Password do not match");
    }

    const existingUser = await TenantUser.findOne({ email });
    if (existingUser) return throwError(400, "User already exists");

    const hashedPassword = await bcrypt.hash(password, parseInt(saltRounds));

    const user = await TenantUser.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id, tenantId: null },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await TenantUser.findOne({ email });
    if (!user) return throwError(404, "User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return throwError(401, "Invalid credentials");

    const token = jwt.sign(
      { id: user._id, tenantId: null },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({ user, token });
  } catch (err) {
    next(err);
  }
};
