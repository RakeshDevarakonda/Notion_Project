import express from "express";
import {  login, signup } from "../controllers/authController.js";
import { loginValidation, registerValidation } from "../../utils/validate.js";

const authRouter = express.Router();

authRouter.post("/signup", registerValidation, signup);

authRouter.post("/login", loginValidation, login);


export default authRouter;
