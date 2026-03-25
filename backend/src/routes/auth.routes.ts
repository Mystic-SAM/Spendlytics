import { Router } from "express";
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
} from "../controllers/auth.controller.js";

const authRoutes = Router();

authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);
authRoutes.post("/logout", logoutController);
authRoutes.post("/refresh-token", refreshTokenController);

export default authRoutes;