import { Router } from "express";
import { loginController, registerController } from "../controllers/auth.controller.js";

const authRoutes = Router();

authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);

export default authRoutes;