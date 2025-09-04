import jwt from "jsonwebtoken";
import TenantUser from "../models/TenantUser.js";

export const isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await TenantUser.findById(decoded.id).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

export const context = async ({ req }) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    return { user: null };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await TenantUser.findById(decoded.id);

    if (!user) {
      return { user: null };
    }

    return { user };
  } catch (err) {
    console.warn("JWT Error:", err.message);
    return { user: null };
  }
};
